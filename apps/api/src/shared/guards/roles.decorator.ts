import { SetMetadata } from '@nestjs/common'
import { RoleUsuario } from '@apa/shared'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: RoleUsuario[]) => SetMetadata(ROLES_KEY, roles)
