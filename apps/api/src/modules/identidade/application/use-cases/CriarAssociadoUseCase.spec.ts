import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { RoleUsuario, StatusAssociado } from '@apa/shared'
import { Associado, IAssociadoRepository, IProvedorAuth, IUsuarioRepository, Usuario } from '@apa/core'
import { CriarAssociadoUseCase } from './CriarAssociadoUseCase'

const makeUsuario = (role = RoleUsuario.ASSOCIADO): Usuario =>
  new Usuario({
    id: 'usr-1',
    nome: 'João',
    email: 'joao@email.com',
    role,
    ativo: true,
    criadoEm: new Date(),
  })

const makeUsuarioRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  contemRegistrosDeAutoria: jest.fn(),
  anonymizar: jest.fn(),
})

const makeAssociadoRepo = (): jest.Mocked<IAssociadoRepository> => ({
  findById: jest.fn(),
  findByUsuarioId: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

const makeProvedorAuth = (): jest.Mocked<IProvedorAuth> => ({
  criarCredencial: jest.fn(),
  ativarAcesso: jest.fn(),
  revogarAcesso: jest.fn(),
  definirSenha: jest.fn(),
  removerCredencial: jest.fn(),
  atualizarMetadata: jest.fn().mockResolvedValue(undefined),
})

describe('CriarAssociadoUseCase', () => {
  let useCase: CriarAssociadoUseCase
  let usuarioRepo: jest.Mocked<IUsuarioRepository>
  let associadoRepo: jest.Mocked<IAssociadoRepository>
  let provedorAuth: jest.Mocked<IProvedorAuth>

  beforeEach(() => {
    usuarioRepo = makeUsuarioRepo()
    associadoRepo = makeAssociadoRepo()
    provedorAuth = makeProvedorAuth()
    useCase = new CriarAssociadoUseCase(usuarioRepo, associadoRepo, provedorAuth)
  })

  it('cria associado para usuário com role ASSOCIADO', async () => {
    const usuario = makeUsuario(RoleUsuario.ASSOCIADO)
    usuarioRepo.findById.mockResolvedValue(usuario)
    associadoRepo.findByUsuarioId.mockResolvedValue(null)
    const saved = new Associado({ id: 'asc-1', usuario, dataIngresso: new Date(), status: StatusAssociado.ATIVO })
    associadoRepo.save.mockResolvedValue(saved)

    const result = await useCase.execute({ usuarioId: 'usr-1' })

    expect(usuarioRepo.findById).toHaveBeenCalledWith('usr-1')
    expect(associadoRepo.save).toHaveBeenCalled()
    expect(result).toBe(saved)
  })

  it('usa dataIngresso fornecida quando presente', async () => {
    const usuario = makeUsuario()
    usuarioRepo.findById.mockResolvedValue(usuario)
    associadoRepo.findByUsuarioId.mockResolvedValue(null)
    associadoRepo.save.mockImplementation(async (a) => a)
    const data = new Date('2024-01-15')

    const result = await useCase.execute({ usuarioId: 'usr-1', dataIngresso: data })

    expect(result.dataIngresso).toBe(data)
  })

  it('registra associadoId no metadata do provedor de auth', async () => {
    const usuario = makeUsuario()
    usuarioRepo.findById.mockResolvedValue(usuario)
    associadoRepo.findByUsuarioId.mockResolvedValue(null)
    associadoRepo.save.mockImplementation(async (a) => a)

    await useCase.execute({ usuarioId: 'usr-1' })

    expect(provedorAuth.atualizarMetadata).toHaveBeenCalledWith('usr-1', expect.objectContaining({ associadoId: expect.any(String) }))
  })

  it('lança NotFoundException quando usuário não existe', async () => {
    usuarioRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute({ usuarioId: 'nao-existe' })).rejects.toThrow(NotFoundException)
    expect(associadoRepo.save).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando usuário tem role ADMIN', async () => {
    usuarioRepo.findById.mockResolvedValue(makeUsuario(RoleUsuario.ADMIN))

    await expect(useCase.execute({ usuarioId: 'usr-1' })).rejects.toThrow(BadRequestException)
    expect(associadoRepo.save).not.toHaveBeenCalled()
  })

  it('lança ConflictException quando usuário já é associado', async () => {
    const usuario = makeUsuario()
    const existente = new Associado({ id: 'asc-existente', usuario, dataIngresso: new Date(), status: StatusAssociado.ATIVO })
    usuarioRepo.findById.mockResolvedValue(usuario)
    associadoRepo.findByUsuarioId.mockResolvedValue(existente)

    await expect(useCase.execute({ usuarioId: 'usr-1' })).rejects.toThrow(ConflictException)
    expect(associadoRepo.save).not.toHaveBeenCalled()
  })
})
