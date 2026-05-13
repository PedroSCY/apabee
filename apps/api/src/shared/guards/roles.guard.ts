import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleUsuario } from '@apa/shared'
import { ROLES_KEY } from './roles.decorator'

/** Guard global de autorização. Verifica se o usuário tem a role exigida pelo decorator @Roles(). Se não houver @Roles(), qualquer autenticado passa. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /** Extrai as roles exigidas do metadata e compara com a role do JWT. */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>()
    return requiredRoles.some((role) => user?.role === role)
  }
}

interface JwtPayload {
  sub: string
  email: string
  role: RoleUsuario
}
