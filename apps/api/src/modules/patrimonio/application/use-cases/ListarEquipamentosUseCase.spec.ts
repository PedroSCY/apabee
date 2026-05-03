import { StatusPatrimonio } from '@apa/shared'
import { Equipamento, IEquipamentoRepository } from '@apa/core'
import { ListarEquipamentosUseCase } from './ListarEquipamentosUseCase'

const makeEquipamento = (id: string): Equipamento =>
  new Equipamento({
    id,
    nome: `Equipamento ${id}`,
    status: StatusPatrimonio.DISPONIVEL,
    criadoEm: new Date(),
  })

const makeRepo = (): jest.Mocked<IEquipamentoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findDisponiveis: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
})

describe('ListarEquipamentosUseCase', () => {
  let useCase: ListarEquipamentosUseCase
  let repo: jest.Mocked<IEquipamentoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new ListarEquipamentosUseCase(repo)
  })

  it('retorna todos os equipamentos', async () => {
    const lista = [makeEquipamento('1'), makeEquipamento('2')]
    repo.findAll.mockResolvedValue(lista)

    const result = await useCase.execute()

    expect(repo.findAll).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(2)
  })

  it('retorna lista vazia quando não há equipamentos', async () => {
    repo.findAll.mockResolvedValue([])

    const result = await useCase.execute()

    expect(result).toEqual([])
  })
})
