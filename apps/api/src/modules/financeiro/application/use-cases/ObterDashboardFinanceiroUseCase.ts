import { Inject, Injectable } from '@nestjs/common'
import {
  DashboardFinanceiro,
  IMovimentoFinanceiroRepository,
  IMensalidadeRepository,
  IObterDashboardFinanceiroUseCase,
} from '@apa/core'
import { StatusMensalidade } from '@apa/shared'
import { MOVIMENTO_FINANCEIRO_REPOSITORY, MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class ObterDashboardFinanceiroUseCase implements IObterDashboardFinanceiroUseCase {
  constructor(
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY)
    private readonly movimentoRepo: IMovimentoFinanceiroRepository,
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
  ) {}

  async execute(ano: number): Promise<DashboardFinanceiro> {
    const [movimentos, pendentes] = await Promise.all([
      this.movimentoRepo.findAll({
        dataInicio: new Date(ano, 0, 1),
        dataFim: new Date(ano, 11, 31, 23, 59, 59),
      }),
      this.mensalidadeRepo.findByStatus(StatusMensalidade.PENDENTE),
    ])

    const graficoMensal = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, receita: 0, despesa: 0 }))

    let receitaYTD = 0
    let despesasYTD = 0

    for (const m of movimentos) {
      const mes = m.data.getMonth()
      if (m.valor > 0) {
        receitaYTD += m.valor
        graficoMensal[mes]!.receita += m.valor
      } else {
        despesasYTD += Math.abs(m.valor)
        graficoMensal[mes]!.despesa += Math.abs(m.valor)
      }
    }

    const inadimplentes = new Set(pendentes.map(p => p.associadoId)).size

    return {
      receitaYTD,
      despesasYTD,
      saldoLiquido: receitaYTD - despesasYTD,
      inadimplentes,
      graficoMensal,
    }
  }
}
