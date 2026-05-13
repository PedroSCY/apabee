import { NotFoundException } from '@nestjs/common'
import { StatusPatrimonio } from '@apa/shared'
import { Equipamento, IEquipamentoRepository } from '@apa/core'
import { BuscarEquipamentoUseCase } from './BuscarEquipamentoUseCase'

const makeEquipamento = (): Equipamento =>
  new Equipamento({
    id: 'eq-uuid-1',
    nome: 'Centrífuga',
    status: StatusPatrimonio.DISPONIVEL,
    criadoEm: new Date(),
  })

const makeRepo = (): jest.Mocked<IEquipamentoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findDisponiveis: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('BuscarEquipamentoUseCase', () => {
  let useCase: BuscarEquipamentoUseCase
  let repo: jest.Mocked<IEquipamentoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new BuscarEquipamentoUseCase(repo)
  })

  it('retorna equipamento quando encontrado', async () => {
    const eq = makeEquipamento()
    repo.findById.mockResolvedValue(eq)

    const result = await useCase.execute('eq-uuid-1')

    expect(repo.findById).toHaveBeenCalledWith('eq-uuid-1')
    expect(result).toBe(eq)
  })

  it('lança NotFoundException quando não encontrado', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException)
  })
})
