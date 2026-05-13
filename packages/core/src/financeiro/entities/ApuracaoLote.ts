import { TipoMovimentoFinanceiro } from '@apa/shared'
import { MovimentoFinanceiro } from './MovimentoFinanceiro'

/** Propriedades da entidade ApuracaoLote. */
interface ApuracaoLoteProps {
  id: string
  loteProducaoId: string
  faturamentoTotal: number
  fechadoEm: Date
}

/** Apuração financeira final de um lote de produção. */
export class ApuracaoLote {
  private readonly props: ApuracaoLoteProps

  constructor(props: ApuracaoLoteProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get loteProducaoId(): string {
    return this.props.loteProducaoId
  }
  get faturamentoTotal(): number {
    return this.props.faturamentoTotal
  }
  get fechadoEm(): Date {
    return this.props.fechadoEm
  }

  /** Calcula o valor final de um associado (RN10). */
  calcularValorFinal(percentual: number, antecipacoes: MovimentoFinanceiro[]): number {
    const direito = (percentual / 100) * this.props.faturamentoTotal
    const totalAntecipado = antecipacoes
      .filter((m) => m.isAntecipacao())
      .reduce((sum, m) => sum + m.valor, 0)
    return direito - totalAntecipado
  }

  /** Gera movimento de rateio final para um associado. */
  gerarRateio(
    associadoId: string,
    percentual: number,
    antecipacoes: MovimentoFinanceiro[],
  ): MovimentoFinanceiro {
    return new MovimentoFinanceiro({
      id: crypto.randomUUID(),
      associadoId,
      loteProducaoId: this.props.loteProducaoId,
      valor: this.calcularValorFinal(percentual, antecipacoes),
      tipo: TipoMovimentoFinanceiro.RATEIO_FINAL,
      data: new Date(),
    })
  }
}
