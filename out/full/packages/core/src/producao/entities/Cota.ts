interface CotaProps {
  id: string
  campanhaId: string
  associadoId: string
  valor: number
  data: Date
  pago: boolean
  confirmadoEm?: Date
}

/** Parcela em dinheiro de um associado numa campanha de aquisição coletiva. */
export class Cota {
  private readonly props: CotaProps

  constructor(props: CotaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get associadoId(): string { return this.props.associadoId }
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
