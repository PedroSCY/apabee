import { TipoMovimentoFinanceiro } from '@apa/shared'

/** Propriedades da entidade MovimentoFinanceiro. */
interface MovimentoFinanceiroProps {
  id: string
  associadoId: string
  loteProducaoId: string
  valor: number
  tipo: TipoMovimentoFinanceiro
  data: Date
}

/** Movimento financeiro de um associado em um lote. */
export class MovimentoFinanceiro {
  private readonly props: MovimentoFinanceiroProps

  constructor(props: MovimentoFinanceiroProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get associadoId(): string {
    return this.props.associadoId
  }
  get loteProducaoId(): string {
    return this.props.loteProducaoId
  }
  get valor(): number {
    return this.props.valor
  }
  get tipo(): TipoMovimentoFinanceiro {
    return this.props.tipo
  }
  get data(): Date {
    return this.props.data
  }

  /** Verifica se o movimento é do tipo antecipação. */
  isAntecipacao(): boolean {
    return this.props.tipo === TipoMovimentoFinanceiro.ANTECIPACAO
  }
}
