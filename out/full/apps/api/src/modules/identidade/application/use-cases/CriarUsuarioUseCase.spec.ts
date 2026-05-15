import { ConflictException } from '@nestjs/common'
import { RoleUsuario } from '@apa/shared'
import { IProvedorAuth, IUsuarioRepository, Usuario } from '@apa/core'
import { CriarUsuarioUseCase } from './CriarUsuarioUseCase'

const makeUsuario = (overrides = {}): Usuario =>
  new Usuario({
    id: 'supabase-uuid',
    nome: 'João Silva',
    email: 'joao@email.com',
    role: RoleUsuario.ASSOCIADO,
    ativo: true,
    criadoEm: new Date(),
    ...overrides,
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
  criarCredencial: jest.fn().mockResolvedValue({ id: 'supabase-uuid' }),
  ativarAcesso: jest.fn(),
  revogarAcesso: jest.fn(),
  definirSenha: jest.fn(),
  removerCredencial: jest.fn(),
  atualizarMetadata: jest.fn(),
})

describe('CriarUsuarioUseCase', () => {
  let useCase: CriarUsuarioUseCase
  let repo: jest.Mocked<IUsuarioRepository>
  let provedorAuth: jest.Mocked<IProvedorAuth>

  beforeEach(() => {
    repo = makeRepo()
    provedorAuth = makeProvedorAuth()
    useCase = new CriarUsuarioUseCase(repo, provedorAuth)
  })

  it('cria usuário quando e-mail ainda não existe', async () => {
    repo.findByEmail.mockResolvedValue(null)
    const saved = makeUsuario()
    repo.save.mockResolvedValue(saved)

    const result = await useCase.execute({
      nome: 'João Silva',
      email: 'joao@email.com',
      role: RoleUsuario.ASSOCIADO,
    })

    expect(repo.findByEmail).toHaveBeenCalledWith('joao@email.com')
    expect(provedorAuth.criarCredencial).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'joao@email.com', role: RoleUsuario.ASSOCIADO }),
    )
    expect(repo.save).toHaveBeenCalled()
    expect(result).toBe(saved)
  })

  it('usa o id retornado pelo provedor de auth', async () => {
    provedorAuth.criarCredencial.mockResolvedValue({ id: 'id-do-provedor' })
    repo.findByEmail.mockResolvedValue(null)
    repo.save.mockImplementation(async (u) => u)

    const result = await useCase.execute({
      nome: 'João',
      email: 'joao@email.com',
      role: RoleUsuario.ASSOCIADO,
    })

    expect(result.id).toBe('id-do-provedor')
  })

  it('normaliza o e-mail para minúsculas', async () => {
    repo.findByEmail.mockResolvedValue(null)
    repo.save.mockImplementation(async (u) => u)

    await useCase.execute({
      nome: 'João',
      email: '  JOAO@EMAIL.COM  ',
      role: RoleUsuario.ASSOCIADO,
    })

    expect(repo.findByEmail).toHaveBeenCalledWith('joao@email.com')
  })

  it('lança ConflictException quando e-mail já existe', async () => {
    repo.findByEmail.mockResolvedValue(makeUsuario())

    await expect(
      useCase.execute({ nome: 'João', email: 'joao@email.com', role: RoleUsuario.ASSOCIADO }),
    ).rejects.toThrow(ConflictException)

    expect(provedorAuth.criarCredencial).not.toHaveBeenCalled()
    expect(repo.save).not.toHaveBeenCalled()
  })
})
