import { OrigemContribuicao } from '@apa/shared'

interface CotaProps {
  id: string
  campanhaId: string
  associadoId?: string
  origem: OrigemContribuicao
  valor: number
  data: Date
  pago: boolean
  confirmadoEm?: Date
}

/** Parcela em dinheiro numa campanha de aquisição. Pode ser de um associado (ASSOCIADO) ou do caixa da APA (RECURSO_PROPRIO). */
export class Cota {
  private readonly props: CotaProps

  constructor(props: CotaProps) {
    const pago = props.origem === OrigemContribuicao.RECURSO_PROPRIO ? true : props.pago
    const confirmadoEm = pago && !props.confirmadoEm ? new Date() : props.confirmadoEm
    this.props = { ...props, pago, confirmadoEm }
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get associadoId(): string | undefined { return this.props.associadoId }
  get origem(): OrigemContribuicao { return this.props.origem }
  get valor(): number { return this.props.valor }
  get data(): Date { return this.props.data }
  get pago(): boolean { return this.props.pago }
  get confirmadoEm(): Date | undefined { return this.props.confirmadoEm }

  confirmar(): Cota {
    if (this.props.pago) throw new Error('Cota já está confirmada')
    return new Cota({ ...this.props, pago: true, confirmadoEm: new Date() })
  }

  cancelar(): Cota {
    if (this.props.pago) throw new Error('Cota já confirmada não pode ser cancelada')
    return new Cota({ ...this.props })
  }

  toJSON() { return { ...this.props } }
}
