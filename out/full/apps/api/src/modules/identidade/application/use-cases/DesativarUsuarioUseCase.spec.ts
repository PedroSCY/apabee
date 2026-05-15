import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RoleUsuario } from '@apa/shared'
import { IProvedorAuth, IUsuarioRepository, Usuario } from '@apa/core'
import { DesativarUsuarioUseCase } from './DesativarUsuarioUseCase'

const makeUsuario = (role: RoleUsuario, ativo = true): Usuario =>
  new Usuario({
    id: 'usr-1',
    nome: 'João',
    email: 'joao@email.com',
    role,
    ativo,
    criadoEm: new Date(),
  })

const makeRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  contemRegistrosDeAutoria: jest.fn(),
})

const makeProvedorAuth = (): jest.Mocked<IProvedorAuth> => ({
  criarCredencial: jest.fn(),
  ativarAcesso: jest.fn(),
  revogarAcesso: jest.fn().mockResolvedValue(undefined),
  definirSenha: jest.fn(),
  removerCredencial: jest.fn(),
  atualizarMetadata: jest.fn(),
})

describe('DesativarUsuarioUseCase', () => {
  let useCase: DesativarUsuarioUseCase
  let repo: jest.Mocked<IUsuarioRepository>
  let provedorAuth: jest.Mocked<IProvedorAuth>

  beforeEach(() => {
    repo = makeRepo()
    provedorAuth = makeProvedorAuth()
    useCase = new DesativarUsuarioUseCase(repo, provedorAuth)
  })

  it('desativa associado ativo e persiste', async () => {
    repo.findById.mockResolvedValue(makeUsuario(RoleUsuario.ASSOCIADO))
    repo.update.mockResolvedValue(makeUsuario(RoleUsuario.ASSOCIADO, false))

    await useCase.execute({ usuarioId: 'usr-1' })

    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ ativo: false }))
    expect(provedorAuth.revogarAcesso).toHaveBeenCalledWith('usr-1')
  })

  it('lança NotFoundException quando usuário não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute({ usuarioId: 'nao-existe' })).rejects.toThrow(NotFoundException)
    expect(repo.update).not.toHaveBeenCalled()
    expect(provedorAuth.revogarAcesso).not.toHaveBeenCalled()
  })

  it('lança BadRequestException ao tentar desativar admin', async () => {
    repo.findById.mockResolvedValue(makeUsuario(RoleUsuario.ADMIN))

    await expect(useCase.execute({ usuarioId: 'usr-1' })).rejects.toThrow(BadRequestException)
    expect(repo.update).not.toHaveBeenCalled()
    expect(provedorAuth.revogarAcesso).not.toHaveBeenCalled()
  })
})
