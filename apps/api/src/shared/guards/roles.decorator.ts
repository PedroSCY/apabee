import { SetMetadata } from '@nestjs/common'
import { RoleUsuario } from '@apa/shared'

/** Metadata key usada pelo RolesGuard para verificar as roles exigidas. */
export const ROLES_KEY = 'roles'
/** Decorator que define quais roles podem acessar a rota. Se omitido, qualquer autenticado passa. */
export const Roles = (...roles: RoleUsuario[]) => SetMetadata(ROLES_KEY, roles)
