import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleUsuario } from '@apa/shared'
import { RolesGuard } from './roles.guard'
import { ROLES_KEY } from './roles.decorator'

const makeContext = (user: { role: RoleUsuario } | null, handler = () => {}, cls = class {}): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: Reflector

  beforeEach(() => {
    reflector = new Reflector()
    guard = new RolesGuard(reflector)
  })

  it('should allow when no @Roles() is set', () => {
    const ctx = makeContext({ role: RoleUsuario.ASSOCIADO })
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should allow ADMIN when @Roles(ADMIN) is set', () => {
    const handler = () => {}
    Reflect.defineMetadata(ROLES_KEY, [RoleUsuario.ADMIN], handler)
    const ctx = makeContext({ role: RoleUsuario.ADMIN }, handler)
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should deny ASSOCIADO when @Roles(ADMIN) is set', () => {
    const handler = () => {}
    Reflect.defineMetadata(ROLES_KEY, [RoleUsuario.ADMIN], handler)
    const ctx = makeContext({ role: RoleUsuario.ASSOCIADO }, handler)
    expect(guard.canActivate(ctx)).toBe(false)
  })

  it('should deny when user is null', () => {
    const handler = () => {}
    Reflect.defineMetadata(ROLES_KEY, [RoleUsuario.ADMIN], handler)
    const ctx = makeContext(null, handler)
    expect(guard.canActivate(ctx)).toBe(false)
  })

  it('should allow any matching role in multi-role @Roles()', () => {
    const handler = () => {}
    Reflect.defineMetadata(ROLES_KEY, [RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO], handler)
    const ctx = makeContext({ role: RoleUsuario.ASSOCIADO }, handler)
    expect(guard.canActivate(ctx)).toBe(true)
  })
})
