import { NotFoundException } from '@nestjs/common'
import { RoleUsuario } from '@apa/shared'
import { IProvedorAuth, IUsuarioRepository, Usuario } from '@apa/core'
import { AtivarUsuarioUseCase } from './AtivarUsuarioUseCase'

const makeUsuario = (ativo: boolean): Usuario =>
  new Usuario({
    id: 'usr-1',
    nome: 'João',
    email: 'joao@email.com',
    role: RoleUsuario.ASSOCIADO,
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
  anonymizar: jest.fn(),
})

const makeProvedorAuth = (): jest.Mocked<IProvedorAuth> => ({
  criarCredencial: jest.fn(),
  ativarAcesso: jest.fn().mockResolvedValue(undefined),
  revogarAcesso: jest.fn(),
  definirSenha: jest.fn(),
  removerCredencial: jest.fn(),
  atualizarMetadata: jest.fn(),
})

describe('AtivarUsuarioUseCase', () => {
  let useCase: AtivarUsuarioUseCase
  let repo: jest.Mocked<IUsuarioRepository>
  let provedorAuth: jest.Mocked<IProvedorAuth>

  beforeEach(() => {
    repo = makeRepo()
    provedorAuth = makeProvedorAuth()
    useCase = new AtivarUsuarioUseCase(repo, provedorAuth)
  })

  it('ativa usuário inativo e persiste', async () => {
    repo.findById.mockResolvedValue(makeUsuario(false))
    repo.update.mockResolvedValue(makeUsuario(true))

    await useCase.execute({ usuarioId: 'usr-1' })

    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ ativo: true }))
    expect(provedorAuth.ativarAcesso).toHaveBeenCalledWith('usr-1')
  })

  it('lança NotFoundException quando usuário não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute({ usuarioId: 'nao-existe' })).rejects.toThrow(NotFoundException)
    expect(repo.update).not.toHaveBeenCalled()
    expect(provedorAuth.ativarAcesso).not.toHaveBeenCalled()
  })
})
