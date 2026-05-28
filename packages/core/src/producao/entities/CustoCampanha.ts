import { CategoriaCusto } from '@apa/shared'

interface CustoCampanhaProps {
  id: string
  campanhaId: string
  descricao: string
  valor: number
  categoria: CategoriaCusto
  /** Associado que adiantou o custo. Na liquidação, o valor é abatido do rateio desse associado (RN27). */
  pagoPorId?: string
  comprovanteUrl?: string
  criadoEm: Date
}

/** Despesa categorizada de uma campanha. Rateada proporcionalmente entre participantes na liquidação (RN27). */
export class CustoCampanha {
  private readonly props: CustoCampanhaProps

  constructor(props: CustoCampanhaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get descricao(): string { return this.props.descricao }
  get valor(): number { return this.props.valor }
  get categoria(): CategoriaCusto { return this.props.categoria }
  get pagoPorId(): string | undefined { return this.props.pagoPorId }
  get comprovanteUrl(): string | undefined { return this.props.comprovanteUrl }
  get criadoEm(): Date { return this.props.criadoEm }

  foiAdiantadoPorAssociado(): boolean { return !!this.props.pagoPorId }

}
