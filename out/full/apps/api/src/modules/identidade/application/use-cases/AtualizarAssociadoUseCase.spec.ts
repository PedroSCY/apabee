import { NotFoundException } from '@nestjs/common'
import { RoleUsuario, StatusAssociado } from '@apa/shared'
import { Associado, IAssociadoRepository, IProvedorAuth, IUsuarioRepository, Usuario } from '@apa/core'
import { AtualizarAssociadoUseCase } from './AtualizarAssociadoUseCase'

const makeUsuario = (ativo = true): Usuario =>
  new Usuario({ id: 'user-1', nome: 'João', email: 'joao@test.com', role: RoleUsuario.ASSOCIADO, ativo, criadoEm: new Date() })

const makeAssociado = (status = StatusAssociado.ATIVO): Associado =>
  new Associado({ id: 'assoc-1', usuario: makeUsuario(), dataIngresso: new Date(), status })

const makeAssociadoRepo = (): jest.Mocked<IAssociadoRepository> => ({
  findById: jest.fn(),
  findByUsuarioId: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

const makeUsuarioRepo = (): jest.Mocked<IUsuarioRepository> => ({
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
  revogarAcesso: jest.fn(),
  definirSenha: jest.fn(),
  removerCredencial: jest.fn(),
  atualizarMetadata: jest.fn(),
})

describe('AtualizarAssociadoUseCase', () => {
  let useCase: AtualizarAssociadoUseCase
  let associadoRepo: jest.Mocked<IAssociadoRepository>
  let usuarioRepo: jest.Mocked<IUsuarioRepository>
  let provedorAuth: jest.Mocked<IProvedorAuth>

  beforeEach(() => {
    associadoRepo = makeAssociadoRepo()
    usuarioRepo = makeUsuarioRepo()
    provedorAuth = makeProvedorAuth()
    useCase = new AtualizarAssociadoUseCase(associadoRepo, usuarioRepo, provedorAuth)
  })

  it('atualiza observacoes sem alterar status do auth quando status não muda', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.ATIVO))
    associadoRepo.update.mockImplementation(async (a) => a)

    const result = await useCase.execute({ associadoId: 'assoc-1', observacoes: 'Nova observação' })

    expect(result.observacoes).toBe('Nova observação')
    expect(provedorAuth.revogarAcesso).not.toHaveBeenCalled()
    expect(provedorAuth.ativarAcesso).not.toHaveBeenCalled()
  })

  it('revoga acesso e desativa usuário ao mudar status para SUSPENSO', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.ATIVO))
    associadoRepo.update.mockImplementation(async (a) => a)
    usuarioRepo.update.mockImplementation(async (u) => u)
    provedorAuth.revogarAcesso.mockResolvedValue(undefined)

    await useCase.execute({ associadoId: 'assoc-1', status: StatusAssociado.SUSPENSO })

    expect(provedorAuth.revogarAcesso).toHaveBeenCalledWith('user-1')
    expect(usuarioRepo.update).toHaveBeenCalledWith(expect.objectContaining({ ativo: false }))
  })

  it('revoga acesso e desativa usuário ao mudar status para INATIVO', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.ATIVO))
    associadoRepo.update.mockImplementation(async (a) => a)
    usuarioRepo.update.mockImplementation(async (u) => u)
    provedorAuth.revogarAcesso.mockResolvedValue(undefined)

    await useCase.execute({ associadoId: 'assoc-1', status: StatusAssociado.INATIVO })

    expect(provedorAuth.revogarAcesso).toHaveBeenCalledWith('user-1')
    expect(usuarioRepo.update).toHaveBeenCalledWith(expect.objectContaining({ ativo: false }))
  })

  it('ativa acesso ao reativar associado SUSPENSO para ATIVO', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.SUSPENSO))
    associadoRepo.update.mockImplementation(async (a) => a)
    usuarioRepo.update.mockImplementation(async (u) => u)
    provedorAuth.ativarAcesso.mockResolvedValue(undefined)

    await useCase.execute({ associadoId: 'assoc-1', status: StatusAssociado.ATIVO })

    expect(provedorAuth.ativarAcesso).toHaveBeenCalledWith('user-1')
    expect(usuarioRepo.update).toHaveBeenCalledWith(expect.objectContaining({ ativo: true }))
  })

  it('não chama provedor de auth quando status é igual ao atual', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.ATIVO))
    associadoRepo.update.mockImplementation(async (a) => a)

    await useCase.execute({ associadoId: 'assoc-1', status: StatusAssociado.ATIVO })

    expect(provedorAuth.revogarAcesso).not.toHaveBeenCalled()
    expect(provedorAuth.ativarAcesso).not.toHaveBeenCalled()
    expect(usuarioRepo.update).not.toHaveBeenCalled()
  })

  it('lança NotFoundException quando associado não existe', async () => {
    associadoRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute({ associadoId: 'nao-existe' })).rejects.toThrow(NotFoundException)
    expect(associadoRepo.update).not.toHaveBeenCalled()
  })
})
