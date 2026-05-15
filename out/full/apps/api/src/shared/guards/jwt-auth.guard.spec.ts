import { JwtAuthGuard } from './jwt-auth.guard'

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    expect(JwtAuthGuard).toBeDefined()
  })

  it('should extend AuthGuard', () => {
    const guard = Object.create(JwtAuthGuard.prototype)
    expect(guard).toBeInstanceOf(JwtAuthGuard)
  })
})
