import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { passportJwtSecret } from 'jwks-rsa'
import { RoleUsuario } from '@apa/shared'

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

/** Estratégia Passport para validação de JWT usando JWKS do Supabase. Algoritmo ES256 (assimétrico). */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
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
        jwksUri: `${config.get<string>('SUPABASE_PROJECT_URL')}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    })
  }

  /** Converte o payload do JWT Supabase para o formato interno JwtPayload usado pelos controllers. */
  async validate(payload: SupabaseJwtPayload): Promise<JwtPayload> {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role ?? RoleUsuario.ASSOCIADO,
      associadoId: payload.app_metadata?.associadoId,
    }
  }
}
