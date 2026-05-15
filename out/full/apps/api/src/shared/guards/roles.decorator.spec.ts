import { Reflector } from '@nestjs/core'
import { RoleUsuario } from '@apa/shared'
import { Roles, ROLES_KEY } from './roles.decorator'

describe('Roles decorator', () => {
  it('should set roles metadata on target', () => {
    class TestController {
      @Roles(RoleUsuario.ADMIN)
      adminRoute() {}

      @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
      sharedRoute() {}
    }

    const reflector = new Reflector()

    const adminRoles = reflector.get<RoleUsuario[]>(
      ROLES_KEY,
      TestController.prototype.adminRoute,
    )
    expect(adminRoles).toEqual([RoleUsuario.ADMIN])

    const sharedRoles = reflector.get<RoleUsuario[]>(
      ROLES_KEY,
      TestController.prototype.sharedRoute,
    )
    expect(sharedRoles).toEqual([RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO])
  })
})
