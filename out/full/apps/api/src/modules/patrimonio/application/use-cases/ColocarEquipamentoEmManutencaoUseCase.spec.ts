import { NotFoundException } from '@nestjs/common'
import { StatusPatrimonio } from '@apa/shared'
import { Equipamento, IEquipamentoRepository } from '@apa/core'
import { ColocarEquipamentoEmManutencaoUseCase } from './ColocarEquipamentoEmManutencaoUseCase'

const makeEquipamento = (status = StatusPatrimonio.DISPONIVEL): Equipamento =>
  new Equipamento({
    id: 'eq-uuid-1',
    nome: 'Centrífuga',
    status,
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

describe('ColocarEquipamentoEmManutencaoUseCase', () => {
  let useCase: ColocarEquipamentoEmManutencaoUseCase
  let repo: jest.Mocked<IEquipamentoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new ColocarEquipamentoEmManutencaoUseCase(repo)
  })

  it('muda status para MANUTENCAO e persiste', async () => {
    const eq = makeEquipamento()
    repo.findById.mockResolvedValue(eq)
    repo.update.mockImplementation(async (e) => e)

    const result = await useCase.execute('eq-uuid-1')

    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusPatrimonio.MANUTENCAO }),
    )
    expect(result.status).toBe(StatusPatrimonio.MANUTENCAO)
  })

  it('não muta a instância original', async () => {
    const eq = makeEquipamento()
    repo.findById.mockResolvedValue(eq)
    repo.update.mockImplementation(async (e) => e)

    await useCase.execute('eq-uuid-1')

    expect(eq.status).toBe(StatusPatrimonio.DISPONIVEL)
  })

  it('lança NotFoundException quando equipamento não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
