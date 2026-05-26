import { BadRequestException, NotFoundException } from '@nestjs/common'
import { LiquidarCampanhaUseCase } from './LiquidarCampanhaUseCase'
import {
  ApuracaoCampanha,
  Campanha,
  Contribuicao,
  CustoCampanha,
  IApuracaoCampanhaRepository,
  ICampanhaRepository,
  IContribuicaoRepository,
  ICustoCampanhaRepository,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  MovimentoFinanceiro,
} from '@apa/core'
import { IMovimentoFinanceiroRepository } from '@apa/core'
import { CategoriaCusto, StatusCampanha, TipoContribuicao, TipoLote, TipoMovimentoFinanceiro } from '@apa/shared'

const makeCampanha = (status: StatusCampanha, tipo = TipoLote.PRODUCAO, receitaTotal = 1000) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo, dataInicio: new Date(), status, receitaTotal, custoTotal: 0, criadoEm: new Date() })

const makeColheita = (associadoId: string, volume: number) =>
  new Contribuicao({ id: `cont-${associadoId}`, campanhaId: 'c-1', associadoId, tipo: TipoContribuicao.COLHEITA, valorMonetario: 0, volume, liquidado: false, criadoEm: new Date() })

const makeDinheiro = (associadoId: string, valorMonetario: number) =>
  new Contribuicao({ id: `cont-${associadoId}`, campanhaId: 'c-1', associadoId, tipo: TipoContribuicao.DINHEIRO, valorMonetario, liquidado: false, criadoEm: new Date() })

const makeCusto = (valor: number, pagoPorId?: string) =>
  new CustoCampanha({ id: 'custo-1', campanhaId: 'c-1', descricao: 'Embalagens', valor, categoria: CategoriaCusto.EMBALAGEM, pagoPorId, criadoEm: new Date() })

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
const apuracaoRepo: jest.Mocked<IApuracaoCampanhaRepository> = {
  findByCampanha: jest.fn(), save: jest.fn(),
}
const movimentoRepo: jest.Mocked<IMovimentoFinanceiroRepository> = {
  findAll: jest.fn(), findByCampanha: jest.fn(), findByAssociadoECampanha: jest.fn(),
  findByAssociado: jest.fn(), save: jest.fn(), saveMany: jest.fn(),
}
const estoqueCampanhaRepo: jest.Mocked<IEstoqueCampanhaRepository> = {
  findByCampanha: jest.fn(), findByCampanhaETipo: jest.fn(),
  save: jest.fn(), update: jest.fn(), salvarMovimentacao: jest.fn(),
  countSaidas: jest.fn(), findMovimentacoes: jest.fn(),
}
const estoquePoolRepo: jest.Mocked<IEstoqueMateriaPrimaRepository> = {
  findAll: jest.fn(), findByTipo: jest.fn(), save: jest.fn(), update: jest.fn(),
  salvarMovimentacao: jest.fn(), findMovimentacoesByEstoque: jest.fn(), deleteByTipo: jest.fn(),
}

describe('LiquidarCampanhaUseCase', () => {
  let useCase: LiquidarCampanhaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new LiquidarCampanhaUseCase(
      campanhaRepo, contribuicaoRepo, custoRepo, apuracaoRepo, movimentoRepo,
      estoqueCampanhaRepo, estoquePoolRepo, { enviarParaAssociado: jest.fn() } as any,
    )
    estoqueCampanhaRepo.findByCampanha.mockResolvedValue([])
    campanhaRepo.update.mockImplementation(async c => c)
    apuracaoRepo.save.mockImplementation(async a => a)
    movimentoRepo.saveMany.mockImplementation(async m => m)
    movimentoRepo.findByCampanha.mockResolvedValue([])
  })

  it('PRODUCAO: rateio por volume entre dois associados (RN18)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, TipoLote.PRODUCAO, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(200)
    custoRepo.findByCampanha.mockResolvedValue([])
    contribuicaoRepo.findByCampanha.mockResolvedValue([
      makeColheita('assoc-A', 60),  // 60% do volume
      makeColheita('assoc-B', 40),  // 40% do volume
    ])

    const result = await useCase.execute('c-1')
    expect(result.status).toBe(StatusCampanha.LIQUIDADA)

    const apuracaoArg = apuracaoRepo.save.mock.calls[0]![0] as ApuracaoCampanha
    const rateioA = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-A')!
    const rateioB = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-B')!

    // assoc-A: 60%, bruto=600, custoRateado=120, final=480
    expect(rateioA.percentual).toBeCloseTo(0.6)
    expect(rateioA.valorBruto).toBeCloseTo(600)
    expect(rateioA.custosRateados).toBeCloseTo(120)
    expect(rateioA.valorFinal).toBeCloseTo(480)

    // assoc-B: 40%, final=320
    expect(rateioB.percentual).toBeCloseTo(0.4)
    expect(rateioB.valorFinal).toBeCloseTo(320)
  })

  it('AQUISICAO: rateio por valor monetário investido', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, TipoLote.AQUISICAO, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(0)
    custoRepo.findByCampanha.mockResolvedValue([])
    contribuicaoRepo.findByCampanha.mockResolvedValue([
      makeDinheiro('assoc-A', 700),
      makeDinheiro('assoc-B', 300),
    ])

    await useCase.execute('c-1')
    const apuracaoArg = apuracaoRepo.save.mock.calls[0]![0] as ApuracaoCampanha
    const rateioA = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-A')!

    expect(rateioA.percentual).toBeCloseTo(0.7)
    expect(rateioA.valorFinal).toBeCloseTo(700)
  })

  it('abate custo adiantado por associado no valorFinal (RN27)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, TipoLote.PRODUCAO, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(200)
    // assoc-A adiantou R$100
    custoRepo.findByCampanha.mockResolvedValue([makeCusto(100, 'assoc-A'), makeCusto(100)])
    contribuicaoRepo.findByCampanha.mockResolvedValue([
      makeColheita('assoc-A', 50),
      makeColheita('assoc-B', 50),
    ])

    await useCase.execute('c-1')
    const apuracaoArg = apuracaoRepo.save.mock.calls[0]![0] as ApuracaoCampanha
    const rateioA = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-A')!
    // sem RN27: 0.5×1000 − 0.5×200 = 400; com RN27: +100 = 500
    expect(rateioA.valorFinal).toBeCloseTo(500)
  })

  it('abate antecipações (ANTECIPACAO) do valorFinal', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, TipoLote.PRODUCAO, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(0)
    custoRepo.findByCampanha.mockResolvedValue([])
    contribuicaoRepo.findByCampanha.mockResolvedValue([makeColheita('assoc-A', 100)])
    movimentoRepo.findByCampanha.mockResolvedValue([
      new MovimentoFinanceiro({ id: 'mv-1', associadoId: 'assoc-A', campanhaId: 'c-1', valor: 150, tipo: TipoMovimentoFinanceiro.ANTECIPACAO, data: new Date() }),
    ])

    await useCase.execute('c-1')
    const apuracaoArg = apuracaoRepo.save.mock.calls[0]![0] as ApuracaoCampanha
    const rateioA = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-A')!
    // bruto=1000, custoRateado=0, antecipacao=150 → final=850
    expect(rateioA.valorFinal).toBeCloseTo(850)
    expect(rateioA.antecipacoes).toBeCloseTo(150)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('c-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha não está CONCLUIDA (RN26)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se não há contribuições', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA))
    custoRepo.sumByCampanha.mockResolvedValue(0)
    custoRepo.findByCampanha.mockResolvedValue([])
    contribuicaoRepo.findByCampanha.mockResolvedValue([])
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })
})
