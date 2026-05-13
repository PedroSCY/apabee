import { ConflictException } from '@nestjs/common'
import { RoleUsuario, StatusAssociado } from '@apa/shared'
import { Associado, IAssociadoRepository, IProvedorAuth, IUsuarioRepository, Usuario } from '@apa/core'
import { CriarAssociadoPendenteUseCase } from './CriarAssociadoPendenteUseCase'

const makeUsuario = (): Usuario =>
  new Usuario({ id: 'user-novo', nome: 'Maria', email: 'maria@test.com', role: RoleUsuario.ASSOCIADO, ativo: false, criadoEm: new Date() })

const makeAssociado = (): Associado =>
  new Associado({ id: 'assoc-novo', usuario: makeUsuario(), dataIngresso: new Date(), status: StatusAssociado.PENDENTE })

const makeUsuarioRepo = (): jest.Mocked<IUsuarioRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  contemRegistrosDeAutoria: jest.fn(),
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
  atualizarMetadata: jest.fn(),
})

describe('CriarAssociadoPendenteUseCase', () => {
  let useCase: CriarAssociadoPendenteUseCase
  let usuarioRepo: jest.Mocked<IUsuarioRepository>
  let associadoRepo: jest.Mocked<IAssociadoRepository>
  let provedorAuth: jest.Mocked<IProvedorAuth>

  beforeEach(() => {
    usuarioRepo = makeUsuarioRepo()
    associadoRepo = makeAssociadoRepo()
    provedorAuth = makeProvedorAuth()
    useCase = new CriarAssociadoPendenteUseCase(usuarioRepo, associadoRepo, provedorAuth)
  })

  it('cria associado com status PENDENTE', async () => {
    usuarioRepo.findByEmail.mockResolvedValue(null)
    provedorAuth.criarCredencial.mockResolvedValue({ id: 'user-novo' })
    provedorAuth.revogarAcesso.mockResolvedValue(undefined)
    usuarioRepo.save.mockResolvedValue(makeUsuario())
    associadoRepo.save.mockResolvedValue(makeAssociado())

    const result = await useCase.execute({ nome: 'Maria', email: 'maria@test.com' })

    expect(result.status).toBe(StatusAssociado.PENDENTE)
  })

  it('normaliza email para lowercase antes de verificar duplicidade', async () => {
    usuarioRepo.findByEmail.mockResolvedValue(null)
    provedorAuth.criarCredencial.mockResolvedValue({ id: 'user-novo' })
    provedorAuth.revogarAcesso.mockResolvedValue(undefined)
    usuarioRepo.save.mockResolvedValue(makeUsuario())
    associadoRepo.save.mockResolvedValue(makeAssociado())

    await useCase.execute({ nome: 'Maria', email: '  MARIA@TEST.COM  ' })

    expect(usuarioRepo.findByEmail).toHaveBeenCalledWith('maria@test.com')
    expect(provedorAuth.criarCredencial).toHaveBeenCalledWith(expect.objectContaining({ email: 'maria@test.com' }))
  })

  it('cria credencial sem enviar email e revoga acesso imediatamente', async () => {
    usuarioRepo.findByEmail.mockResolvedValue(null)
    provedorAuth.criarCredencial.mockResolvedValue({ id: 'user-novo' })
    provedorAuth.revogarAcesso.mockResolvedValue(undefined)
    usuarioRepo.save.mockResolvedValue(makeUsuario())
    associadoRepo.save.mockResolvedValue(makeAssociado())

    await useCase.execute({ nome: 'Maria', email: 'maria@test.com' })

    expect(provedorAuth.criarCredencial).toHaveBeenCalledWith(expect.objectContaining({ enviarEmail: false }))
    expect(provedorAuth.revogarAcesso).toHaveBeenCalledWith('user-novo')
  })

  it('cria usuário com role ASSOCIADO e ativo = false', async () => {
    usuarioRepo.findByEmail.mockResolvedValue(null)
    provedorAuth.criarCredencial.mockResolvedValue({ id: 'user-novo' })
    provedorAuth.revogarAcesso.mockResolvedValue(undefined)
    usuarioRepo.save.mockImplementation(async (u) => u)
    associadoRepo.save.mockResolvedValue(makeAssociado())

    await useCase.execute({ nome: 'Maria', email: 'maria@test.com' })

    expect(usuarioRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ role: RoleUsuario.ASSOCIADO, ativo: false }),
    )
  })

  it('lança ConflictException quando email já existe', async () => {
    usuarioRepo.findByEmail.mockResolvedValue(makeUsuario())

    await expect(useCase.execute({ nome: 'Maria', email: 'maria@test.com' })).rejects.toThrow(ConflictException)
    expect(provedorAuth.criarCredencial).not.toHaveBeenCalled()
    expect(associadoRepo.save).not.toHaveBeenCalled()
  })
})
