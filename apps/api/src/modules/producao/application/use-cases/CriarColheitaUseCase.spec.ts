import { BadRequestException } from '@nestjs/common'
import { CriarColheitaUseCase } from './CriarColheitaUseCase'
import {
  EstoqueMateriaPrima,
  IColheitaRepository,
  IContribuicaoRepository,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  ISafraRepository,
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
  delete: jest.fn(),
}

const estoqueRepo: jest.Mocked<IEstoqueMateriaPrimaRepository> = {
  findAll: jest.fn(),
  findByTipo: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  salvarMovimentacao: jest.fn(),
  findMovimentacoesByEstoque: jest.fn(),
  deleteByTipo: jest.fn(),
}

const estoqueCampanhaRepo: jest.Mocked<IEstoqueCampanhaRepository> = {
  findByCampanha: jest.fn(),
  findByCampanhaETipo: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  salvarMovimentacao: jest.fn(),
  countSaidas: jest.fn(),
  findMovimentacoes: jest.fn(),
}

const contribuicaoRepo: jest.Mocked<IContribuicaoRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  findByAssociado: jest.fn(),
  findByCampanhaEAssociado: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

const safraRepo: jest.Mocked<ISafraRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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
    useCase = new CriarColheitaUseCase(colheitaRepo, estoqueRepo, estoqueCampanhaRepo, contribuicaoRepo, safraRepo)
    estoqueRepo.update.mockImplementation(async (e) => e)
    estoqueRepo.salvarMovimentacao.mockImplementation(async (m) => m)
    estoqueCampanhaRepo.update.mockImplementation(async (e) => e)
    estoqueCampanhaRepo.salvarMovimentacao.mockImplementation(async (m) => m)
  })

  it('colheita sem campanhaId vai ao pool (RN14)', async () => {
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoque())

    const result = await useCase.execute(input)
    expect(result.volume).toBe(10)
    expect(estoqueRepo.update).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.salvarMovimentacao).toHaveBeenCalledTimes(1)
    expect(estoqueCampanhaRepo.update).not.toHaveBeenCalled()
  })

  it('cria estoque pool novo quando não existe (RN14)', async () => {
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueRepo.findByTipo.mockResolvedValue(null)
    estoqueRepo.save.mockImplementation(async (e) => e)

    await useCase.execute(input)
    expect(estoqueRepo.save).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.update).not.toHaveBeenCalled()
  })

  it('colheita com campanhaId vai ao EstoqueCampanha (RN14)', async () => {
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueCampanhaRepo.findByCampanhaETipo.mockResolvedValue(null)
    estoqueCampanhaRepo.save.mockImplementation(async (e) => e)
    contribuicaoRepo.save.mockImplementation(async (c) => c)

    await useCase.execute({ ...input, campanhaId: 'camp-1' })
    expect(estoqueCampanhaRepo.save).toHaveBeenCalledTimes(1)
    expect(estoqueCampanhaRepo.salvarMovimentacao).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.update).not.toHaveBeenCalled()
    expect(contribuicaoRepo.save).toHaveBeenCalledTimes(1)
  })

  it('lança BadRequestException se volume <= 0', async () => {
    await expect(useCase.execute({ ...input, volume: 0 })).rejects.toThrow(BadRequestException)
  })
})
