import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { RoleUsuario } from '@apa/shared'

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
      secretOrKey: process.env.JWT_SECRET ?? 'fallback-dev-secret',
    })
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return { sub: payload.sub, email: payload.email, role: payload.role }
  }
}
