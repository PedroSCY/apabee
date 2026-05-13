import { RoleUsuario, StatusAssociado } from '@apa/shared'
import { Associado, IAssociadoRepository, Usuario } from '@apa/core'
import { ListarAssociadosUseCase } from './ListarAssociadosUseCase'

const makeAssociado = (id: string): Associado =>
  new Associado({
    id,
    usuario: new Usuario({
      id: `usr-${id}`,
      nome: 'João',
      email: `${id}@email.com`,
      role: RoleUsuario.ASSOCIADO,
      ativo: true,
      criadoEm: new Date(),
    }),
    dataIngresso: new Date(),
    status: StatusAssociado.ATIVO,
  })

const makeRepo = (): jest.Mocked<IAssociadoRepository> => ({
  findById: jest.fn(),
  findByUsuarioId: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('ListarAssociadosUseCase', () => {
  let useCase: ListarAssociadosUseCase
  let repo: jest.Mocked<IAssociadoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new ListarAssociadosUseCase(repo)
  })

  it('retorna lista de associados do repositório', async () => {
    const lista = [makeAssociado('1'), makeAssociado('2')]
    repo.findAll.mockResolvedValue(lista)

    const result = await useCase.execute()

    expect(repo.findAll).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(2)
    expect(result).toBe(lista)
  })

  it('retorna lista vazia quando não há associados', async () => {
    repo.findAll.mockResolvedValue([])

    const result = await useCase.execute()

    expect(result).toEqual([])
  })
})
