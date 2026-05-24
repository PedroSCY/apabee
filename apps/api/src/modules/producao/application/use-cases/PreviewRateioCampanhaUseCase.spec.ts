import { BadRequestException, NotFoundException } from '@nestjs/common'
import { PreviewRateioCampanhaUseCase } from './PreviewRateioCampanhaUseCase'
import {
  Campanha,
  Contribuicao,
  CustoCampanha,
  ICampanhaRepository,
  IContribuicaoRepository,
  ICustoCampanhaRepository,
  IMovimentoFinanceiroRepository,
} from '@apa/core'
import { CategoriaCusto, StatusCampanha, TipoContribuicao, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha, tipo = TipoLote.PRODUCAO, receitaTotal = 1000) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo, dataInicio: new Date(), status, receitaTotal, custoTotal: 0, criadoEm: new Date() })

const makeColheita = (associadoId: string, volume: number) =>
  new Contribuicao({ id: `cont-${associadoId}`, campanhaId: 'c-1', associadoId, tipo: TipoContribuicao.COLHEITA, valorMonetario: 0, volume, liquidado: false, criadoEm: new Date() })

const makeDinheiro = (associadoId: string, valorMonetario: number) =>
  new Contribuicao({ id: `cont-${associadoId}`, campanhaId: 'c-1', associadoId, tipo: TipoContribuicao.DINHEIRO, valorMonetario, liquidado: false, criadoEm: new Date() })

const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(), findByCodigo: jest.fn(), findAll: jest.fn(), findVencidas: jest.fn(),
  save: jest.fn(), update: jest.fn(), delete: jest.fn(),
}
const contribuicaoRepo: jest.Mocked<IContribuicaoRepository> = {
  findById: jest.fn(), findByCampanha: jest.fn(), findByAssociado: jest.fn(),
  findByCampanhaEAssociado: jest.fn(), sumByCampanha: jest.fn(),
  save: jest.fn(), update: jest.fn(), delete: jest.fn(),
}
const custoRepo: jest.Mocked<ICustoCampanhaRepository> = {
  findById: jest.fn(), findByCampanha: jest.fn(), sumByCampanha: jest.fn(),
  save: jest.fn(), delete: jest.fn(),
}
const movimentoRepo: jest.Mocked<IMovimentoFinanceiroRepository> = {
  findAll: jest.fn(), findByCampanha: jest.fn(), findByAssociadoECampanha: jest.fn(),
  findByAssociado: jest.fn(), save: jest.fn(), saveMany: jest.fn(),
}

describe('PreviewRateioCampanhaUseCase', () => {
  let useCase: PreviewRateioCampanhaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new PreviewRateioCampanhaUseCase(campanhaRepo, contribuicaoRepo, custoRepo, movimentoRepo)
    custoRepo.sumByCampanha.mockResolvedValue(0)
    custoRepo.findByCampanha.mockResolvedValue([])
    movimentoRepo.findByCampanha.mockResolvedValue([])
  })

  it('calcula preview PRODUCAO por volume entre dois associados (RN18)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, TipoLote.PRODUCAO, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(200)
    contribuicaoRepo.findByCampanha.mockResolvedValue([
      makeColheita('assoc-A', 60),
      makeColheita('assoc-B', 40),
    ])

    const result = await useCase.execute('c-1')

    expect(result.faturamentoTotal).toBe(1000)
    expect(result.custoTotal).toBe(200)
    expect(result.lucroLiquido).toBe(800)
    expect(result.participantes).toHaveLength(2)

    const a = result.participantes.find(p => p.associadoId === 'assoc-A')!
    expect(a.percentual).toBeCloseTo(0.6)
    expect(a.valorBruto).toBeCloseTo(600)
    expect(a.custosRateados).toBeCloseTo(120)
    expect(a.valorFinal).toBeCloseTo(480)

    const b = result.participantes.find(p => p.associadoId === 'assoc-B')!
    expect(b.percentual).toBeCloseTo(0.4)
    expect(b.valorFinal).toBeCloseTo(320)
  })

  it('calcula preview AQUISICAO por valor monetário (RN18)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, TipoLote.AQUISICAO, 500))
    contribuicaoRepo.findByCampanha.mockResolvedValue([
      makeDinheiro('assoc-A', 300),
      makeDinheiro('assoc-B', 200),
    ])

    const result = await useCase.execute('c-1')
    const a = result.participantes.find(p => p.associadoId === 'assoc-A')!
    expect(a.percentual).toBeCloseTo(0.6)
    expect(a.valorFinal).toBeCloseTo(300)
  })

  it('não persiste nada (read-only)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA))
    contribuicaoRepo.findByCampanha.mockResolvedValue([makeColheita('a', 100)])

    await useCase.execute('c-1')

    expect(campanhaRepo.update).not.toHaveBeenCalled()
    expect(movimentoRepo.saveMany).not.toHaveBeenCalled()
    expect(movimentoRepo.save).not.toHaveBeenCalled()
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('c-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha não está CONCLUIDA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se receitaTotal = 0', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, TipoLote.PRODUCAO, 0))
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se não há contribuições', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA))
    contribuicaoRepo.findByCampanha.mockResolvedValue([])
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })
})
