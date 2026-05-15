import { TipoMovimentoFinanceiro } from '@apa/shared'

interface MovimentoFinanceiroProps {
  id: string
  associadoId: string
  campanhaId?: string
  valor: number
  tipo: TipoMovimentoFinanceiro
  descricao?: string
  data: Date
}

/** Movimento financeiro de um associado — antecipação, rateio final ou custo adiantado. */
export class MovimentoFinanceiro {
  private readonly props: MovimentoFinanceiroProps

  constructor(props: MovimentoFinanceiroProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get associadoId(): string { return this.props.associadoId }
  get campanhaId(): string | undefined { return this.props.campanhaId }
  get valor(): number { return this.props.valor }
  get tipo(): TipoMovimentoFinanceiro { return this.props.tipo }
  get descricao(): string | undefined { return this.props.descricao }
  get data(): Date { return this.props.data }

  isAntecipacao(): boolean { return this.props.tipo === TipoMovimentoFinanceiro.ANTECIPACAO }
  isRateioFinal(): boolean { return this.props.tipo === TipoMovimentoFinanceiro.RATEIO_FINAL }
}
