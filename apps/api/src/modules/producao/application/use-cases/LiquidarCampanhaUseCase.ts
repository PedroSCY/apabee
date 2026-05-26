import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ApuracaoCampanha,
  Campanha,
  EstoqueMateriaPrima,
  IApuracaoCampanhaRepository,
  ICampanhaRepository,
  IContribuicaoRepository,
  ICustoCampanhaRepository,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  ILiquidarCampanhaUseCase,
  MovimentacaoEstoque,
  MovimentoFinanceiro,
  RateioCampanha,
} from '@apa/core'
import { IMovimentoFinanceiroRepository } from '@apa/core'
import { StatusCampanha, TipoLote, TipoMovimentacao, TipoMovimentoFinanceiro, TipoNotificacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  APURACAO_CAMPANHA_REPOSITORY,
  CAMPANHA_REPOSITORY,
  CONTRIBUICAO_REPOSITORY,
  CUSTO_CAMPANHA_REPOSITORY,
  ESTOQUE_CAMPANHA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  MOVIMENTO_FINANCEIRO_REPOSITORY,
} from '../../producao.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

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
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoquePoolRepo: IEstoqueMateriaPrimaRepository,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  async execute(id: string): Promise<Campanha> {
    const campanha = await this.campanhaRepo.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.CONCLUIDA)
      throw new BadRequestException('Apenas campanhas CONCLUIDAS podem ser liquidadas')
    if (campanha.tipo !== TipoLote.PRODUCAO)
      throw new BadRequestException('Apenas campanhas de produção podem ser liquidadas')
    if (campanha.receitaTotal <= 0)
      throw new BadRequestException('Informe a receita total antes de liquidar (use PATCH /campanhas/:id/receita)')

    // 1. Soma de custos
    const custoTotal = await this.custoRepo.sumByCampanha(id)

    // 2. Custos adiantados por associado (RN27)
    const custos = await this.custoRepo.findByCampanha(id)
    const custosAdiantadosPorAssociado = new Map<string, number>()
    for (const custo of custos) {
      if (custo.pagoPorId) {
        const anterior = custosAdiantadosPorAssociado.get(custo.pagoPorId) ?? 0
        custosAdiantadosPorAssociado.set(custo.pagoPorId, anterior + custo.valor)
      }
    }

    // 3. Busca contribuições
    const contribuicoes = await this.contribuicaoRepo.findByCampanha(id)
    if (contribuicoes.length === 0)
      throw new BadRequestException('Campanha não possui contribuições registradas')

    // 4. Calcula proporção por associado (null = contribuição da associação — inclusa no total mas sem payout)
    // PRODUCAO → rateio por volume (kg/litro coletados — RN18)
    // AQUISICAO → rateio por valor monetário investido
    const proporcaoPorAssociado = new Map<string | null, number>()
    for (const c of contribuicoes) {
      const base = campanha.tipo === TipoLote.PRODUCAO
        ? (c.volume ?? 0)
        : c.valorMonetario
      const anterior = proporcaoPorAssociado.get(c.associadoId) ?? 0
      proporcaoPorAssociado.set(c.associadoId, anterior + base)
    }

    const somaTotal = Array.from(proporcaoPorAssociado.values()).reduce((a, b) => a + b, 0)
    if (somaTotal === 0)
      throw new BadRequestException('Soma das contribuições é zero — impossível calcular rateio')

    // 5. Antecipações por associado
    const movimentos = await this.movimentoRepo.findByCampanha(id)
    const antecipacoesPorAssociado = new Map<string, number>()
    for (const m of movimentos) {
      if (m.tipo === TipoMovimentoFinanceiro.ANTECIPACAO) {
        const anterior = antecipacoesPorAssociado.get(m.associadoId) ?? 0
        antecipacoesPorAssociado.set(m.associadoId, anterior + m.valor)
      }
    }

    // 6. Calcula rateio (RN13/RN18)
    const faturamentoTotal = campanha.receitaTotal
    const lucroLiquido = faturamentoTotal - custoTotal
    const rateios: RateioCampanha[] = []
    const movimentosParaSalvar: MovimentoFinanceiro[] = []

    for (const [associadoId, proporcao] of proporcaoPorAssociado) {
      // Contribuições da associação (null) reduzem o total geral mas não geram payout
      if (associadoId === null) continue

      const percentual = proporcao / somaTotal
      const valorBruto = percentual * faturamentoTotal
      const custosRateados = percentual * custoTotal
      const custoAdiantado = custosAdiantadosPorAssociado.get(associadoId) ?? 0
      const antecipacoes = antecipacoesPorAssociado.get(associadoId) ?? 0
      // RN27: associado que adiantou custo não paga novamente — abate do rateio
      const valorFinal = valorBruto - custosRateados + custoAdiantado - antecipacoes

      rateios.push({ associadoId, contribuicaoTotal: proporcao, percentual, valorBruto, custosRateados, antecipacoes, valorFinal })

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

    // 8. Transfere saldo residual de EstoqueCampanha para o pool (RN26)
    await this.transferirResidualParaPool(id)

    const campanhaLiquidada = campanha.liquidar(faturamentoTotal, custoTotal)
    const resultado = await this.campanhaRepo.update(campanhaLiquidada)

    // 9. Notifica cada participante com rateio positivo
    for (const rateio of rateios) {
      if (rateio.valorFinal > 0) {
        void this.notificacaoService.enviarParaAssociado(
          rateio.associadoId,
          TipoNotificacao.RATEIO_DISPONIVEL,
          'Rateio disponível',
          `Campanha ${campanha.codigo}: R$ ${rateio.valorFinal.toFixed(2).replace('.', ',')} creditados.`,
          { campanhaId: id, campanhaCode: campanha.codigo },
        )
      }
    }

    return resultado
  }

  /** Move saldo restante do EstoqueCampanha para o pool global após liquidação. */
  private async transferirResidualParaPool(campanhaId: string): Promise<void> {
    const estoques = await this.estoqueCampanhaRepo.findByCampanha(campanhaId)
    for (const ec of estoques) {
      if (ec.quantidadeDisponivel <= 0) continue

      const poolExistente = await this.estoquePoolRepo.findByTipo(ec.tipoMateriaPrimaId)
      let poolAtualizado: EstoqueMateriaPrima
      if (poolExistente) {
        poolAtualizado = await this.estoquePoolRepo.update(poolExistente.entrada(ec.quantidadeDisponivel))
      } else {
        const novo = new EstoqueMateriaPrima({
          id: randomUUID(),
          tipoMateriaPrimaId: ec.tipoMateriaPrimaId,
          quantidadeDisponivel: 0,
          unidade: ec.unidade,
          atualizadoEm: new Date(),
        })
        poolAtualizado = await this.estoquePoolRepo.save(novo.entrada(ec.quantidadeDisponivel))
      }

      await this.estoquePoolRepo.salvarMovimentacao(
        new MovimentacaoEstoque({
          id: randomUUID(),
          estoqueId: poolAtualizado.id,
          tipo: TipoMovimentacao.ENTRADA,
          quantidade: ec.quantidadeDisponivel,
          referenciaId: campanhaId,
          criadoEm: new Date(),
        }),
      )

      await this.estoqueCampanhaRepo.update(ec.saida(ec.quantidadeDisponivel))
    }
  }
}
