import { CriarTipoMateriaPrimaUseCase } from './CriarTipoMateriaPrimaUseCase'
import { ITipoMateriaPrimaRepository, TipoMateriaPrima } from '@apa/core'
import { UnidadeMedida } from '@apa/shared'

const mockRepo: jest.Mocked<ITipoMateriaPrimaRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('CriarTipoMateriaPrimaUseCase', () => {
  let useCase: CriarTipoMateriaPrimaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarTipoMateriaPrimaUseCase(mockRepo)
  })

  it('cria e salva o tipo de matéria-prima', async () => {
    const input = { nome: 'Mel', unidade: UnidadeMedida.KG }
    mockRepo.save.mockImplementation(async (t) => t)

    const result = await useCase.execute(input)

    expect(mockRepo.save).toHaveBeenCalledTimes(1)
    expect(result.nome).toBe('Mel')
    expect(result.unidade).toBe(UnidadeMedida.KG)
    expect(result.id).toBeDefined()
  })

  it('faz trim no nome', async () => {
    mockRepo.save.mockImplementation(async (t) => t)
    const result = await useCase.execute({ nome: '  Própolis  ', unidade: UnidadeMedida.GRAMA })
    expect(result.nome).toBe('Própolis')
  })

  it('propaga erro do repositório', async () => {
    mockRepo.save.mockRejectedValue(new Error('DB error'))
    await expect(useCase.execute({ nome: 'Mel', unidade: UnidadeMedida.KG })).rejects.toThrow('DB error')
  })
})
