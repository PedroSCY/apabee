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
  MovimentoFinanceiro,
} from '@apa/core'
import { IMovimentoFinanceiroRepository } from '@apa/core'
import { CategoriaCusto, RegraAcordo, StatusCampanha, TipoContribuicao, TipoLote, TipoMovimentoFinanceiro } from '@apa/shared'

const makeCampanha = (status: StatusCampanha, receitaTotal = 1000) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo: TipoLote.PRODUCAO, dataInicio: new Date(), status, receitaTotal, custoTotal: 0, criadoEm: new Date() })

const makeContribuicao = (associadoId: string, valorMonetario: number, tipo = TipoContribuicao.DINHEIRO) =>
  new Contribuicao({ id: `cont-${associadoId}`, campanhaId: 'c-1', associadoId, tipo, valorMonetario, liquidado: false, criadoEm: new Date() })

const makeCusto = (valor: number, pagoPorId?: string) =>
  new CustoCampanha({ id: 'custo-1', campanhaId: 'c-1', descricao: 'Embalagens', valor, categoria: CategoriaCusto.EMBALAGEM, pagoPorId, criadoEm: new Date() })

const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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
const custoRepo: jest.Mocked<ICustoCampanhaRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}
const apuracaoRepo: jest.Mocked<IApuracaoCampanhaRepository> = {
  findByCampanha: jest.fn(),
  save: jest.fn(),
}
const movimentoRepo: jest.Mocked<IMovimentoFinanceiroRepository> = {
  findByCampanha: jest.fn(),
  findByAssociadoECampanha: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
}

describe('LiquidarCampanhaUseCase', () => {
  let useCase: LiquidarCampanhaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new LiquidarCampanhaUseCase(campanhaRepo, contribuicaoRepo, custoRepo, apuracaoRepo, movimentoRepo)
    campanhaRepo.update.mockImplementation(async c => c)
    apuracaoRepo.save.mockImplementation(async a => a)
    movimentoRepo.saveMany.mockImplementation(async m => m)
    movimentoRepo.findByCampanha.mockResolvedValue([])
  })

  it('liquida campanha e calcula rateio proporcional entre dois associados', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(200)
    custoRepo.findByCampanha.mockResolvedValue([])
    contribuicaoRepo.findByCampanha.mockResolvedValue([
      makeContribuicao('assoc-A', 600),
      makeContribuicao('assoc-B', 400),
    ])

    const result = await useCase.execute('c-1')
    expect(result.status).toBe(StatusCampanha.LIQUIDADA)
    expect(apuracaoRepo.save).toHaveBeenCalledTimes(1)

    const apuracaoArg = apuracaoRepo.save.mock.calls[0]![0] as ApuracaoCampanha
    const rateioA = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-A')!
    const rateioB = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-B')!

    // assoc-A: 60%, bruto = 600, custoRateado = 120, final = 480
    expect(rateioA.percentual).toBeCloseTo(0.6)
    expect(rateioA.valorBruto).toBeCloseTo(600)
    expect(rateioA.custosRateados).toBeCloseTo(120)
    expect(rateioA.valorFinal).toBeCloseTo(480)

    // assoc-B: 40%, bruto = 400, custoRateado = 80, final = 320
    expect(rateioB.percentual).toBeCloseTo(0.4)
    expect(rateioB.valorFinal).toBeCloseTo(320)
  })

  it('abate custo adiantado por associado no valorFinal (RN27)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(200)
    // assoc-A adiantou R$100 em embalagens
    custoRepo.findByCampanha.mockResolvedValue([makeCusto(100, 'assoc-A'), makeCusto(100)])
    contribuicaoRepo.findByCampanha.mockResolvedValue([
      makeContribuicao('assoc-A', 500),
      makeContribuicao('assoc-B', 500),
    ])

    await useCase.execute('c-1')
    const apuracaoArg = apuracaoRepo.save.mock.calls[0]![0] as ApuracaoCampanha
    const rateioA = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-A')!
    // sem RN27: 0.5×1000 − 0.5×200 = 400; com RN27: +100 = 500
    expect(rateioA.valorFinal).toBeCloseTo(500)
  })

  it('abate antecipações (ANTECIPACAO) do valorFinal', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(0)
    custoRepo.findByCampanha.mockResolvedValue([])
    contribuicaoRepo.findByCampanha.mockResolvedValue([makeContribuicao('assoc-A', 1000)])
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

  it('resolve contribuições tipo ACORDO com PERCENTUAL_LUCRO', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(200)
    custoRepo.findByCampanha.mockResolvedValue([])
    // ACORDO: 10% do lucro líquido (1000-200=800 → 80)
    const acordo = new Contribuicao({
      id: 'cont-A',
      campanhaId: 'c-1',
      associadoId: 'assoc-A',
      tipo: TipoContribuicao.ACORDO,
      valorMonetario: 0,
      regraCalculo: RegraAcordo.PERCENTUAL_LUCRO,
      regraParametro: 10,
      liquidado: false,
      criadoEm: new Date(),
    })
    contribuicaoRepo.findByCampanha.mockResolvedValue([acordo, makeContribuicao('assoc-B', 720)])

    await useCase.execute('c-1')
    const apuracaoArg = apuracaoRepo.save.mock.calls[0]![0] as ApuracaoCampanha
    const rateioA = apuracaoArg.rateios.find(r => r.associadoId === 'assoc-A')!
    // ACORDO resolvido: 10% × 800 = 80 → total contrib 80+720=800; assoc-A share=10%
    expect(rateioA.contribuicaoTotal).toBeCloseTo(80)
    expect(rateioA.percentual).toBeCloseTo(0.1)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('c-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha não está CONCLUIDA (RN26)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, 1000))
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se não há contribuições', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA, 1000))
    custoRepo.sumByCampanha.mockResolvedValue(0)
    custoRepo.findByCampanha.mockResolvedValue([])
    contribuicaoRepo.findByCampanha.mockResolvedValue([])
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })
})
