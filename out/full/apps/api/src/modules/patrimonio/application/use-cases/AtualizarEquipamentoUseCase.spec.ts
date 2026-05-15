import { NotFoundException } from '@nestjs/common'
import { StatusPatrimonio } from '@apa/shared'
import { Equipamento, IEquipamentoRepository } from '@apa/core'
import { AtualizarEquipamentoUseCase } from './AtualizarEquipamentoUseCase'

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

describe('AtualizarEquipamentoUseCase', () => {
  let useCase: AtualizarEquipamentoUseCase
  let repo: jest.Mocked<IEquipamentoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new AtualizarEquipamentoUseCase(repo)
  })

  it('atualiza nome e persiste', async () => {
    const original = makeEquipamento()
    repo.findById.mockResolvedValue(original)
    repo.update.mockImplementation(async (e) => e)

    const result = await useCase.execute('eq-uuid-1', { nome: 'Novo Nome' })

    expect(repo.update).toHaveBeenCalled()
    expect(result.nome).toBe('Novo Nome')
  })

  it('mantém campos não enviados inalterados', async () => {
    const original = makeEquipamento({ numeroSerie: 'SN-001' })
    repo.findById.mockResolvedValue(original)
    repo.update.mockImplementation(async (e) => e)

    const result = await useCase.execute('eq-uuid-1', { nome: 'Novo Nome' })

    expect(result.numeroSerie).toBe('SN-001')
  })

  it('lança NotFoundException quando equipamento não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('inexistente', { nome: 'X' })).rejects.toThrow(NotFoundException)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
