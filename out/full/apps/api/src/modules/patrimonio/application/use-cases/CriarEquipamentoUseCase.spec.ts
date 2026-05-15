import { StatusPatrimonio } from '@apa/shared'
import { Equipamento, IEquipamentoRepository } from '@apa/core'
import { CriarEquipamentoUseCase } from './CriarEquipamentoUseCase'

const makeEquipamento = (overrides = {}): Equipamento =>
  new Equipamento({
    id: 'eq-uuid-1',
    nome: 'Centrífuga',
    status: StatusPatrimonio.DISPONIVEL,
    criadoEm: new Date(),
    ...overrides,
  })

const makeRepo = (): jest.Mocked<IEquipamentoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findDisponiveis: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('CriarEquipamentoUseCase', () => {
  let useCase: CriarEquipamentoUseCase
  let repo: jest.Mocked<IEquipamentoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new CriarEquipamentoUseCase(repo)
  })

  it('cria equipamento com status DISPONIVEL', async () => {
    const saved = makeEquipamento()
    repo.save.mockResolvedValue(saved)

    const result = await useCase.execute({ nome: 'Centrífuga' })

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusPatrimonio.DISPONIVEL }),
    )
    expect(result).toBe(saved)
  })

  it('trim no nome antes de salvar', async () => {
    repo.save.mockImplementation(async (e) => e)

    const result = await useCase.execute({ nome: '  Centrífuga  ' })

    expect(result.nome).toBe('Centrífuga')
  })

  it('persiste numeroSerie e descricao quando fornecidos', async () => {
    repo.save.mockImplementation(async (e) => e)

    const result = await useCase.execute({
      nome: 'Centrífuga',
      numeroSerie: 'SN-001',
      descricao: 'Elétrica 9 quadros',
    })

    expect(result.numeroSerie).toBe('SN-001')
    expect(result.descricao).toBe('Elétrica 9 quadros')
  })
})
