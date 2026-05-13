import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CriarColheitaUseCase } from './CriarColheitaUseCase'
import {
  EstoqueMateriaPrima,
  IColheitaRepository,
  IEstoqueMateriaPrimaRepository,
  ILoteProducaoRepository,
  LoteProducao,
} from '@apa/core'
import { UnidadeMedida, StatusLote, TipoLote } from '@apa/shared'

const makeLote = (status: StatusLote) =>
  new LoteProducao({ id: 'lote-1', tipo: TipoLote.PRODUCAO, periodo: '2025-01', dataInicio: new Date(), status, custoTotal: 0 })

const makeEstoque = () =>
  new EstoqueMateriaPrima({ id: 'estoque-1', tipoMateriaPrimaId: 'tipo-1', quantidadeDisponivel: 5, unidade: UnidadeMedida.KG, atualizadoEm: new Date() })

const colheitaRepo: jest.Mocked<IColheitaRepository> = {
  findById: jest.fn(),
  findByAssociado: jest.fn(),
  findByLote: jest.fn(),
  save: jest.fn(),
}

const loteRepo: jest.Mocked<ILoteProducaoRepository> = {
  findById: jest.fn(),
  findAtivos: jest.fn(),
  findAll: jest.fn(),
  findAbertosVencidos: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
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
    loteProducaoId: 'lote-1',
    volume: 10,
    unidade: UnidadeMedida.KG,
    dataColheita: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarColheitaUseCase(colheitaRepo, loteRepo, estoqueRepo)
    estoqueRepo.update.mockImplementation(async (e) => e)
    estoqueRepo.salvarMovimentacao.mockImplementation(async (m) => m)
  })

  it('cria colheita e atualiza estoque existente (RN03)', async () => {
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.ABERTO))
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoque())

    const result = await useCase.execute(input)
    expect(result.volume).toBe(10)
    expect(estoqueRepo.update).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.salvarMovimentacao).toHaveBeenCalledTimes(1)
  })

  it('cria estoque novo quando não existe (RN03)', async () => {
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.ABERTO))
    colheitaRepo.save.mockImplementation(async (c) => c)
    estoqueRepo.findByTipo.mockResolvedValue(null)
    estoqueRepo.save.mockImplementation(async (e) => e)

    await useCase.execute(input)
    expect(estoqueRepo.save).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.update).not.toHaveBeenCalled()
  })

  it('lança NotFoundException se lote não existe', async () => {
    loteRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se lote fechado', async () => {
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.FECHADO))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se volume <= 0', async () => {
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.ABERTO))
    await expect(useCase.execute({ ...input, volume: 0 })).rejects.toThrow(BadRequestException)
  })
})
