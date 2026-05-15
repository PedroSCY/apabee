import { BadRequestException } from '@nestjs/common'
import { CriarColheitaUseCase } from './CriarColheitaUseCase'
import {
  EstoqueMateriaPrima,
  IColheitaRepository,
  IEstoqueMateriaPrimaRepository,
} from '@apa/core'
import { UnidadeMedida } from '@apa/shared'

const makeEstoque = () =>
  new EstoqueMateriaPrima({ id: 'estoque-1', tipoMateriaPrimaId: 'tipo-1', quantidadeDisponivel: 5, unidade: UnidadeMedida.KG, atualizadoEm: new Date() })

const colheitaRepo: jest.Mocked<IColheitaRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByAssociado: jest.fn(),
  findByCampanha: jest.fn(),
  save: jest.fn(),
}

const estoqueRepo: jest.Mocked<IEstoqueMateriaPrimaRepository> = {
  findAll: jest.fn(),
  findByTipo: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  salvarMovimentacao: jest.fn(),
  findMovimentacoesByEstoque: jest.fn(),
}

describe('CriarColheitaUseCase', () => {
  let useCase: CriarColheitaUseCase

  const input = {
    associadoId: 'assoc-1',
    tipoMateriaPrimaId: 'tipo-1',
    volume: 10,
    unidade: UnidadeMedida.KG,
    dataColheita: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarColheitaUseCase(colheitaRepo, estoqueRepo)
    estoqueRepo.update.mockImplementation(async (e) => e)
    estoqueRepo.salvarMovimentacao.mockImplementation(async (m) => m)
  })

  it('cria colheita e atualiza estoque existente (RN03)', async () => {
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoque())

    const result = await useCase.execute(input)
    expect(result.volume).toBe(10)
    expect(estoqueRepo.update).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.salvarMovimentacao).toHaveBeenCalledTimes(1)
  })

  it('cria estoque novo quando não existe (RN03)', async () => {
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueRepo.findByTipo.mockResolvedValue(null)
    estoqueRepo.save.mockImplementation(async (e) => e)

    await useCase.execute(input)
    expect(estoqueRepo.save).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.update).not.toHaveBeenCalled()
  })

  it('cria colheita sem campanha — vai ao pool diretamente (RN14)', async () => {
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoque())

    const result = await useCase.execute({ ...input, campanhaId: undefined })
    expect(result.campanhaId).toBeUndefined()
    expect(estoqueRepo.update).toHaveBeenCalledTimes(1)
  })

  it('lança BadRequestException se volume <= 0', async () => {
    await expect(useCase.execute({ ...input, volume: 0 })).rejects.toThrow(BadRequestException)
  })
})
