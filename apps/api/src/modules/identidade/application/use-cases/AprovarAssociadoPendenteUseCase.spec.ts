import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RoleUsuario, StatusAssociado } from '@apa/shared'
import { Associado, IAssociadoRepository, IProvedorAuth, IUsuarioRepository, Usuario } from '@apa/core'
import { AprovarAssociadoPendenteUseCase } from './AprovarAssociadoPendenteUseCase'

const makeUsuario = (): Usuario =>
  new Usuario({ id: 'user-1', nome: 'Maria', email: 'maria@test.com', role: RoleUsuario.ASSOCIADO, ativo: false, criadoEm: new Date() })

const makeAssociado = (status = StatusAssociado.PENDENTE): Associado =>
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

describe('AprovarAssociadoPendenteUseCase', () => {
  let useCase: AprovarAssociadoPendenteUseCase
  let associadoRepo: jest.Mocked<IAssociadoRepository>
  let usuarioRepo: jest.Mocked<IUsuarioRepository>
  let provedorAuth: jest.Mocked<IProvedorAuth>

  beforeEach(() => {
    associadoRepo = makeAssociadoRepo()
    usuarioRepo = makeUsuarioRepo()
    provedorAuth = makeProvedorAuth()
    useCase = new AprovarAssociadoPendenteUseCase(associadoRepo, usuarioRepo, provedorAuth)
  })

  it('aprova associado PENDENTE: define senha, ativa acesso e atualiza metadata', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.PENDENTE))
    provedorAuth.definirSenha.mockResolvedValue(undefined)
    provedorAuth.ativarAcesso.mockResolvedValue(undefined)
    provedorAuth.atualizarMetadata.mockResolvedValue(undefined)
    usuarioRepo.update.mockImplementation(async (u) => u)
    associadoRepo.update.mockImplementation(async (a) => a)

    const result = await useCase.execute({ associadoId: 'assoc-1', senha: 'SenhaForte123!' })

    expect(provedorAuth.definirSenha).toHaveBeenCalledWith('user-1', 'SenhaForte123!')
    expect(provedorAuth.ativarAcesso).toHaveBeenCalledWith('user-1')
    expect(provedorAuth.atualizarMetadata).toHaveBeenCalledWith('user-1', { associadoId: 'assoc-1' })
    expect(result.status).toBe(StatusAssociado.ATIVO)
  })

  it('ativa o usuário no banco ao aprovar', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.PENDENTE))
    provedorAuth.definirSenha.mockResolvedValue(undefined)
    provedorAuth.ativarAcesso.mockResolvedValue(undefined)
    provedorAuth.atualizarMetadata.mockResolvedValue(undefined)
    usuarioRepo.update.mockImplementation(async (u) => u)
    associadoRepo.update.mockImplementation(async (a) => a)

    await useCase.execute({ associadoId: 'assoc-1', senha: 'SenhaForte123!' })

    expect(usuarioRepo.update).toHaveBeenCalledWith(expect.objectContaining({ ativo: true }))
  })

  it('usa dataIngresso fornecida quando informada', async () => {
    const dataIngresso = new Date('2024-01-15')
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.PENDENTE))
    provedorAuth.definirSenha.mockResolvedValue(undefined)
    provedorAuth.ativarAcesso.mockResolvedValue(undefined)
    provedorAuth.atualizarMetadata.mockResolvedValue(undefined)
    usuarioRepo.update.mockImplementation(async (u) => u)
    associadoRepo.update.mockImplementation(async (a) => a)

    const result = await useCase.execute({ associadoId: 'assoc-1', senha: 'SenhaForte123!', dataIngresso })

    expect(result.dataIngresso).toEqual(dataIngresso)
  })

  it('lança NotFoundException quando associado não existe', async () => {
    associadoRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute({ associadoId: 'nao-existe', senha: 'abc' })).rejects.toThrow(NotFoundException)
    expect(provedorAuth.definirSenha).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando associado não está PENDENTE', async () => {
    associadoRepo.findById.mockResolvedValue(makeAssociado(StatusAssociado.ATIVO))

    await expect(useCase.execute({ associadoId: 'assoc-1', senha: 'SenhaForte123!' })).rejects.toThrow(BadRequestException)
    expect(provedorAuth.definirSenha).not.toHaveBeenCalled()
    expect(provedorAuth.ativarAcesso).not.toHaveBeenCalled()
  })
})
