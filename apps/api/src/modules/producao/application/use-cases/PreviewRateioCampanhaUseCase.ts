import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ICampanhaRepository,
  IContribuicaoRepository,
  ICustoCampanhaRepository,
  IMovimentoFinanceiroRepository,
  IPreviewRateioCampanhaUseCase,
  PreviewRateioResult,
} from '@apa/core'
import { StatusCampanha, TipoLote, TipoMovimentoFinanceiro } from '@apa/shared'
import {
  CAMPANHA_REPOSITORY,
  CONTRIBUICAO_REPOSITORY,
  CUSTO_CAMPANHA_REPOSITORY,
  MOVIMENTO_FINANCEIRO_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
/** Calcula o preview do rateio sem persistir — mesma lógica de LiquidarCampanha (RN13/RN18), read-only. */
export class PreviewRateioCampanhaUseCase implements IPreviewRateioCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
    @Inject(CUSTO_CAMPANHA_REPOSITORY)
    private readonly custoRepo: ICustoCampanhaRepository,
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY)
    private readonly movimentoRepo: IMovimentoFinanceiroRepository,
  ) {}

  async execute(id: string): Promise<PreviewRateioResult> {
    const campanha = await this.campanhaRepo.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.CONCLUIDA)
      throw new BadRequestException('Preview de rateio disponível apenas para campanhas CONCLUIDAS')
    if (campanha.receitaTotal <= 0)
      throw new BadRequestException('Informe a receita total antes de calcular o preview (PATCH /campanhas/:id/receita)')

    const custoTotal = await this.custoRepo.sumByCampanha(id)

    const custos = await this.custoRepo.findByCampanha(id)
    const custosAdiantadosPorAssociado = new Map<string, number>()
    for (const custo of custos) {
      if (custo.pagoPorId) {
        const anterior = custosAdiantadosPorAssociado.get(custo.pagoPorId) ?? 0
        custosAdiantadosPorAssociado.set(custo.pagoPorId, anterior + custo.valor)
      }
    }

    const contribuicoes = await this.contribuicaoRepo.findByCampanha(id)
    if (contribuicoes.length === 0)
      throw new BadRequestException('Campanha não possui contribuições registradas')

    const proporcaoPorAssociado = new Map<string | null, number>()
    for (const c of contribuicoes) {
      const base = campanha.tipo === TipoLote.PRODUCAO ? (c.volume ?? 0) : c.valorMonetario
      proporcaoPorAssociado.set(c.associadoId, (proporcaoPorAssociado.get(c.associadoId) ?? 0) + base)
    }

    const somaTotal = Array.from(proporcaoPorAssociado.values()).reduce((a, b) => a + b, 0)
    if (somaTotal === 0)
      throw new BadRequestException('Soma das contribuições é zero — impossível calcular rateio')

    const movimentos = await this.movimentoRepo.findByCampanha(id)
    const antecipacoesPorAssociado = new Map<string, number>()
    for (const m of movimentos) {
      if (m.tipo === TipoMovimentoFinanceiro.ANTECIPACAO) {
        antecipacoesPorAssociado.set(m.associadoId, (antecipacoesPorAssociado.get(m.associadoId) ?? 0) + m.valor)
      }
    }

    const faturamentoTotal = campanha.receitaTotal
    const lucroLiquido = faturamentoTotal - custoTotal
    const participantes: PreviewRateioResult['participantes'] = []

    for (const [associadoId, proporcao] of proporcaoPorAssociado) {
      // Contribuições da associação (null) afetam o somaTotal mas não aparecem no preview de rateio
      if (associadoId === null) continue

      const percentual = proporcao / somaTotal
      const valorBruto = percentual * faturamentoTotal
      const custosRateados = percentual * custoTotal
      const custoAdiantado = custosAdiantadosPorAssociado.get(associadoId) ?? 0
      const antecipacoes = antecipacoesPorAssociado.get(associadoId) ?? 0
      const valorFinal = valorBruto - custosRateados + custoAdiantado - antecipacoes
      participantes.push({ associadoId, contribuicaoTotal: proporcao, percentual, valorBruto, custosRateados, antecipacoes, valorFinal })
    }

    return { faturamentoTotal, custoTotal, lucroLiquido, participantes }
  }
}
