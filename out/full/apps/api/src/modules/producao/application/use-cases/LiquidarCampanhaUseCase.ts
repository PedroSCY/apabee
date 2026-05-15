import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ApuracaoCampanha,
  Campanha,
  Contribuicao,
  IApuracaoCampanhaRepository,
  ICampanhaRepository,
  IContribuicaoRepository,
  ICustoCampanhaRepository,
  ILiquidarCampanhaUseCase,
  MovimentoFinanceiro,
  RateioCampanha,
} from '@apa/core'
import { IMovimentoFinanceiroRepository } from '@apa/core'
import { RegraAcordo, StatusCampanha, TipoContribuicao, TipoMovimentoFinanceiro } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  APURACAO_CAMPANHA_REPOSITORY,
  CAMPANHA_REPOSITORY,
  CONTRIBUICAO_REPOSITORY,
  CUSTO_CAMPANHA_REPOSITORY,
  MOVIMENTO_FINANCEIRO_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
/** Orquestra a liquidação de uma campanha (CONCLUIDA → LIQUIDADA): calcula rateio, gera movimentos financeiros, salva ApuracaoCampanha (RN26). */
export class LiquidarCampanhaUseCase implements ILiquidarCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
    @Inject(CUSTO_CAMPANHA_REPOSITORY)
    private readonly custoRepo: ICustoCampanhaRepository,
    @Inject(APURACAO_CAMPANHA_REPOSITORY)
    private readonly apuracaoRepo: IApuracaoCampanhaRepository,
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY)
    private readonly movimentoRepo: IMovimentoFinanceiroRepository,
  ) {}

  async execute(id: string): Promise<Campanha> {
    const campanha = await this.campanhaRepo.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.CONCLUIDA)
      throw new BadRequestException('Apenas campanhas CONCLUIDAS podem ser liquidadas')

    // 1. Soma de custos
    const custoTotal = await this.custoRepo.sumByCampanha(id)

    // 2. Busca todos os custos para verificar pagoPorId (RN27)
    const custos = await this.custoRepo.findByCampanha(id)
    const custosAdiantadosPorAssociado = new Map<string, number>()
    for (const custo of custos) {
      if (custo.pagoPorId) {
        const anterior = custosAdiantadosPorAssociado.get(custo.pagoPorId) ?? 0
        custosAdiantadosPorAssociado.set(custo.pagoPorId, anterior + custo.valor)
      }
    }

    // 3. Busca contribuições e calcula valorMonetario dos ACORDOs
    const contribuicoes = await this.contribuicaoRepo.findByCampanha(id)
    const contribuicoesResolvidas = this.resolverAcordos(
      contribuicoes,
      campanha.receitaTotal - custoTotal,
      0, // total de unidades vendidas — simplificado no MVP
    )

    // 4. Agrupa contribuições por associado
    const totalPorAssociado = new Map<string, number>()
    for (const c of contribuicoesResolvidas) {
      const anterior = totalPorAssociado.get(c.associadoId) ?? 0
      totalPorAssociado.set(c.associadoId, anterior + c.valorMonetario)
    }

    if (totalPorAssociado.size === 0)
      throw new BadRequestException('Campanha não possui contribuições registradas')

    const somaTotalContribuicoes = Array.from(totalPorAssociado.values()).reduce((a, b) => a + b, 0)
    const lucroLiquido = campanha.receitaTotal - custoTotal
    const faturamentoTotal = campanha.receitaTotal

    // 5. Busca antecipações por associado
    const movimentos = await this.movimentoRepo.findByCampanha(id)
    const antecipacoesPorAssociado = new Map<string, number>()
    for (const m of movimentos) {
      if (m.tipo === TipoMovimentoFinanceiro.ANTECIPACAO) {
        const anterior = antecipacoesPorAssociado.get(m.associadoId) ?? 0
        antecipacoesPorAssociado.set(m.associadoId, anterior + m.valor)
      }
    }

    // 6. Calcula rateio (RN13/RN18)
    const rateios: RateioCampanha[] = []
    const movimentosParaSalvar: MovimentoFinanceiro[] = []

    for (const [associadoId, contribuicaoTotal] of totalPorAssociado) {
      const percentual = somaTotalContribuicoes > 0
        ? contribuicaoTotal / somaTotalContribuicoes
        : 0
      const valorBruto = percentual * faturamentoTotal
      const custosRateados = percentual * custoTotal
      const custoAdiantado = custosAdiantadosPorAssociado.get(associadoId) ?? 0
      const antecipacoes = antecipacoesPorAssociado.get(associadoId) ?? 0
      // RN27: associado que adiantou custo não paga novamente — abate do rateio
      const valorFinal = valorBruto - custosRateados + custoAdiantado - antecipacoes

      rateios.push({ associadoId, contribuicaoTotal, percentual, valorBruto, custosRateados, antecipacoes, valorFinal })

      if (valorFinal !== 0) {
        movimentosParaSalvar.push(
          new MovimentoFinanceiro({
            id: randomUUID(),
            associadoId,
            campanhaId: id,
            valor: valorFinal,
            tipo: TipoMovimentoFinanceiro.RATEIO_FINAL,
            descricao: `Rateio final — campanha ${campanha.codigo}`,
            data: new Date(),
          }),
        )
      }
    }

    // 7. Persiste tudo
    await this.apuracaoRepo.save(
      new ApuracaoCampanha({
        id: randomUUID(),
        campanhaId: id,
        faturamentoTotal,
        custoTotal,
        lucroLiquido,
        liquidadoEm: new Date(),
        rateios,
      }),
    )

    if (movimentosParaSalvar.length > 0)
      await this.movimentoRepo.saveMany(movimentosParaSalvar)

    const campanhaLiquidada = campanha.liquidar(faturamentoTotal, custoTotal)
    return this.campanhaRepo.update(campanhaLiquidada)
  }

  /** Calcula valorMonetario dos ACORDOs baseado nas regras configuradas. */
  private resolverAcordos(
    contribuicoes: Contribuicao[],
    lucroLiquido: number,
    totalUnidadesVendidas: number,
  ): Contribuicao[] {
    return contribuicoes.map(c => {
      if (c.tipo !== TipoContribuicao.ACORDO || c.regraCalculo === undefined || c.regraParametro === undefined)
        return c
      let valor = 0
      if (c.regraCalculo === RegraAcordo.PERCENTUAL_LUCRO)
        valor = lucroLiquido * (c.regraParametro / 100)
      else if (c.regraCalculo === RegraAcordo.FIXO_POR_UNIDADE)
        valor = totalUnidadesVendidas * c.regraParametro
      return c.resolverAcordo(valor)
    })
  }
}
