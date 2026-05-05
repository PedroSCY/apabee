import { StatusPedido } from '@apa/shared'
import { ItemPedido } from './ItemPedido'

interface PedidoProps {
  id: string
  clienteNome: string
  clienteEmail: string
  clienteTelefone?: string
  status: StatusPedido
  itens: ItemPedido[]
  criadoEm: Date
}

export class Pedido {
  private readonly props: PedidoProps

  constructor(props: PedidoProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get clienteNome(): string {
    return this.props.clienteNome
  }
  get clienteEmail(): string {
    return this.props.clienteEmail
  }
  get clienteTelefone(): string | undefined {
    return this.props.clienteTelefone
  }
  get criadoEm(): Date {
    return this.props.criadoEm
  }
  get status(): StatusPedido {
    return this.props.status
  }
  get itens(): ItemPedido[] {
    return [...this.props.itens]
  }

  calcularTotal(): number {
    return this.props.itens.reduce((sum, item) => sum + item.subtotal(), 0)
  }

  podeSerCancelado(): boolean {
    return [StatusPedido.PENDENTE].includes(this.props.status)
  }

  confirmar(): Pedido {
    if (this.props.status !== StatusPedido.PENDENTE) {
      throw new Error('Apenas pedidos pendentes podem ser confirmados.')
    }
    return new Pedido({ ...this.props, status: StatusPedido.CONFIRMADO })
  }

  cancelar(): Pedido {
    if (!this.podeSerCancelado()) {
      throw new Error('Pedido não pode ser cancelado no status atual.')
    }
    return new Pedido({ ...this.props, status: StatusPedido.CANCELADO })
  }

  marcarEnviado(): Pedido {
    if (this.props.status !== StatusPedido.CONFIRMADO) {
      throw new Error('Apenas pedidos confirmados podem ser enviados.')
    }
    return new Pedido({ ...this.props, status: StatusPedido.ENVIADO })
  }
}
