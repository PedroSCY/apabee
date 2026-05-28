import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { passportJwtSecret } from 'jwks-rsa'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { RoleUsuario } from '@apa/shared'
import { PrismaService } from '../database/prisma.service'

interface SupabaseJwtPayload {
  sub: string
  email: string
  role: string
  app_metadata?: {
    role?: RoleUsuario
    associadoId?: string
  }
}

/** Payload extraído do JWT após validação. Disponibilizado como req.user nos controllers. */
export interface JwtPayload {
  sub: string
  email: string
  role: RoleUsuario
  associadoId?: string
}

/**
 * Estratégia JWT com resolução de role em 4 camadas:
 *
 *  1. Fast path   — role presente no JWT (caso normal após sync)
 *  2. DB path     — JWT sem role → consulta `clientes` (id = sub) ou `usuarios` (email)
 *                   O banco é a fonte da verdade; o JWT é apenas um cache.
 *  3. Auto-sync   — usuário ausente do banco (sync inicial falhou ou conta pré-existente):
 *                   busca dados no Supabase Admin API, cria `Cliente`, retorna CLIENTE.
 *                   Protegido por barreira de conflito de e-mail com `usuarios`.
 *  4. Rejeição    — usuário não encontrado em nenhuma fonte → null → Passport lança 401.
 *                   NUNCA assume um role aqui.
 *
 * Ao encontrar ou criar um CLIENTE via DB/auto-sync, atualiza o app_metadata no Supabase
 * de forma assíncrona para que tokens futuros usem o fast path.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly supabaseAdmin: SupabaseClient

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const projectUrl = config.get<string>('SUPABASE_PROJECT_URL')!

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => (req?.query as Record<string, string>)?.token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${projectUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    })

    this.supabaseAdmin = createClient(projectUrl, config.get<string>('SUPABASE_SERVICE_KEY')!)
  }

  async validate(payload: SupabaseJwtPayload): Promise<JwtPayload | null> {
    // ── 1. Fast path ─────────────────────────────────────────────────────────
    const roleFromToken = payload.app_metadata?.role as RoleUsuario | undefined
    if (roleFromToken) {
      return {
        sub: payload.sub,
        email: payload.email,
        role: roleFromToken,
        associadoId: payload.app_metadata?.associadoId,
      }
    }

    // ── 2. DB path — JWT sem role ─────────────────────────────────────────────
    // 2a. Verifica tabela `clientes` (id = Supabase user id)
    try {
      const cliente = await this.prisma.cliente.findUnique({ where: { id: payload.sub } })
      if (cliente) {
        // Sincroniza role ao Supabase em background para que próximos tokens usem fast path
        void this.supabaseAdmin.auth.admin
          .updateUserById(payload.sub, { app_metadata: { role: RoleUsuario.CLIENTE } })
          .catch((err) => console.error('[JWT] Sync role Supabase falhou:', err))

        return { sub: payload.sub, email: payload.email, role: RoleUsuario.CLIENTE }
      }
    } catch (err) {
      console.error('[JWT] Erro ao consultar tabela clientes:', err)
    }

    // 2b. Verifica tabela `usuarios` (ADMIN / ASSOCIADO)
    try {
      const usuario = await this.prisma.usuario.findFirst({
        where: { email: payload.email, deletadoEm: null },
        include: { associado: { select: { id: true } } },
      })
      if (usuario) {
        return {
          sub: payload.sub,
          email: payload.email,
          role: usuario.role as RoleUsuario,
          associadoId: usuario.associado?.id,
        }
      }
    } catch (err) {
      console.error('[JWT] Erro ao consultar tabela usuarios:', err)
    }

    // ── 3. Auto-sync de recuperação ──────────────────────────────────────────
    // Usuário tem JWT válido mas está ausente no banco (sync inicial falhou ou
    // usuário autenticou antes da funcionalidade de loja ser implementada).
    // Busca dados completos no Supabase Admin API e provisiona o Cliente agora.
    try {
      const { data: adminData } = await this.supabaseAdmin.auth.admin.getUserById(payload.sub)
      const adminUser = adminData?.user

      if (adminUser) {
        // Barreira de conflito: e-mail não pode pertencer a um associado/admin
        const existeUsuario = await this.prisma.usuario
          .findFirst({ where: { email: payload.email, deletadoEm: null } })
          .catch(() => null)

        if (existeUsuario) {
          console.warn('[JWT] Auto-sync bloqueado — e-mail pertence a usuário interno:', payload.email)
          return null
        }

        const meta = adminUser.user_metadata ?? {}
        const nome = (meta['full_name'] ?? meta['name'] ?? payload.email) as string
        const fotoUrl = (meta['avatar_url'] ?? meta['picture'] ?? null) as string | null
        const agora = new Date()

        await this.prisma.cliente.create({
          data: { id: payload.sub, nome, email: payload.email, fotoUrl, criadoEm: agora, atualizadoEm: agora },
        })

        // Sync do role ao Supabase em background — próximos tokens usarão fast path
        void this.supabaseAdmin.auth.admin
          .updateUserById(payload.sub, { app_metadata: { role: RoleUsuario.CLIENTE } })
          .catch((err) => console.error('[JWT] Auto-sync role Supabase falhou:', err))

        console.log('[JWT] Auto-sync: cliente provisionado em runtime para', payload.sub)
        return { sub: payload.sub, email: payload.email, role: RoleUsuario.CLIENTE }
      }
    } catch (err) {
      console.error('[JWT] Erro no auto-sync de cliente:', err)
    }

    // ── 4. Rejeição — usuário não encontrado em nenhuma fonte ─────────────────
    // Retornar null faz o Passport lançar 401. Nunca assumir um role aqui.
    console.warn('[JWT] Usuário não encontrado no banco:', payload.sub, payload.email)
    return null
  }
}
