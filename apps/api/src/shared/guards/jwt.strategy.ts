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
  }
}

export interface JwtPayload {
  sub: string
  email: string
  role: RoleUsuario
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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

  async validate(payload: SupabaseJwtPayload): Promise<JwtPayload> {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role ?? RoleUsuario.ASSOCIADO,
    }
  }
}
