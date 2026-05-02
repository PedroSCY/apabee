import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { passportJwtSecret } from 'jwks-rsa'
import { RoleUsuario } from '@apa/shared'

// Estrutura real do JWT emitido pelo Supabase Auth (ECC P-256 / ES256)
interface SupabaseJwtPayload {
  sub: string
  email: string
  role: string // 'authenticated' | 'anon' — role Supabase, não do domínio
  app_metadata?: {
    role?: RoleUsuario
  }
}

export interface JwtPayload {
  sub: string
  email: string
  role: RoleUsuario
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Busca a chave pública via JWKS — funciona com RS256 e ES256
      // Rotação de chave no Supabase não requer mudança de código
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    })
  }

  async validate(payload: SupabaseJwtPayload): Promise<JwtPayload> {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role ?? RoleUsuario.ASSOCIADO,
    }
  }
}
