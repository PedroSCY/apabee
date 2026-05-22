import { OrigemContribuicao } from '@apa/shared'

interface PedidoAquisicaoProps {
  id: string
  campanhaId: string
  itemAquisicaoId: string
  associadoId?: string
  origem: OrigemContribuicao
  quantidade: number
  valorTotal: number
  pago: boolean
  pagoEm?: Date
  entregue: boolean
  entregueEm?: Date
  criadoEm: Date
}

/** Pedido individual dentro de uma campanha de aquisição INDIVIDUAL. Rastreia o que cada associado quer, se pagou e se recebeu. */
export class PedidoAquisicao {
  private readonly props: PedidoAquisicaoProps

  constructor(props: PedidoAquisicaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get itemAquisicaoId(): string { return this.props.itemAquisicaoId }
  get associadoId(): string | undefined { return this.props.associadoId }
  get origem(): OrigemContribuicao { return this.props.origem }
  get quantidade(): number { return this.props.quantidade }
  get valorTotal(): number { return this.props.valorTotal }
  get pago(): boolean { return this.props.pago }
  get pagoEm(): Date | undefined { return this.props.pagoEm }
  get entregue(): boolean { return this.props.entregue }
  get entregueEm(): Date | undefined { return this.props.entregueEm }
  get criadoEm(): Date { return this.props.criadoEm }

  confirmarPagamento(): PedidoAquisicao {
    if (this.props.pago) throw new Error('Pedido já está marcado como pago')
    return new PedidoAquisicao({ ...this.props, pago: true, pagoEm: new Date() })
  }

  marcarEntregue(): PedidoAquisicao {
    if (!this.props.pago) throw new Error('Pedido deve estar pago antes de ser entregue')
    if (this.props.entregue) throw new Error('Pedido já está marcado como entregue')
    return new PedidoAquisicao({ ...this.props, entregue: true, entregueEm: new Date() })
  }

  toJSON() { return { ...this.props } }
}
