import { OpcaoEntrega, StatusPedidoLoja, MetodoPagamentoPedidoLoja } from '@apa/shared'

export interface ItemPedidoLoja {
  id: string
  pedidoLojaId: string
  produtoId: string
  nomeProduto: string
  precoUnitario: number
  quantidade: number
  campanhaCodigo?: string
}

/** Snapshot imutável do endereço de entrega gravado junto com o pedido */
export interface EnderecoEntregaSnapshot {
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

interface PedidoLojaProps {
  id: string
  clienteId: string
  status: StatusPedidoLoja
  opcaoEntrega: OpcaoEntrega
  enderecoEntregaId?: string
  valorTotal: number
  observacoes?: string
  metodoPagamento?: MetodoPagamentoPedidoLoja
  itens: ItemPedidoLoja[]
  cobrancaGatewayId?: string
  cobrancaPixCopiaECola?: string
  cobrancaPixQrCodeBase64?: string
  cobrancaExpiracaoEm?: Date
  cobrancaValorCobrado?: number
  cardInstallments?: number
  cardPaymentMethodId?: string
  criadoEm: Date
  enderecoEntregaSnapshot?: EnderecoEntregaSnapshot
}

const TRANSICOES_PERMITIDAS: Partial<Record<StatusPedidoLoja, StatusPedidoLoja[]>> = {
  [StatusPedidoLoja.PAGO]: [StatusPedidoLoja.EM_PREPARACAO, StatusPedidoLoja.CANCELADO],
  [StatusPedidoLoja.EM_PREPARACAO]: [StatusPedidoLoja.SAIU_ENTREGA],
  [StatusPedidoLoja.SAIU_ENTREGA]: [StatusPedidoLoja.ENTREGUE],
}

export class PedidoLoja {
  private readonly props: PedidoLojaProps

  constructor(props: PedidoLojaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get clienteId(): string { return this.props.clienteId }
  get status(): StatusPedidoLoja { return this.props.status }
  get opcaoEntrega(): OpcaoEntrega { return this.props.opcaoEntrega }
  get enderecoEntregaId(): string | undefined { return this.props.enderecoEntregaId }
  get valorTotal(): number { return this.props.valorTotal }
  get observacoes(): string | undefined { return this.props.observacoes }
  get metodoPagamento(): MetodoPagamentoPedidoLoja | undefined { return this.props.metodoPagamento }
  get itens(): ItemPedidoLoja[] { return [...this.props.itens] }
  get cobrancaGatewayId(): string | undefined { return this.props.cobrancaGatewayId }
  get cobrancaPixCopiaECola(): string | undefined { return this.props.cobrancaPixCopiaECola }
  get cobrancaPixQrCodeBase64(): string | undefined { return this.props.cobrancaPixQrCodeBase64 }
  get cobrancaExpiracaoEm(): Date | undefined { return this.props.cobrancaExpiracaoEm }
  get cobrancaValorCobrado(): number | undefined { return this.props.cobrancaValorCobrado }
  get cardInstallments(): number | undefined { return this.props.cardInstallments }
  get cardPaymentMethodId(): string | undefined { return this.props.cardPaymentMethodId }
  get criadoEm(): Date { return this.props.criadoEm }
  get enderecoEntregaSnapshot(): EnderecoEntregaSnapshot | undefined { return this.props.enderecoEntregaSnapshot }

  calcularTotal(): number {
    return this.props.itens.reduce((sum, item) => sum + item.precoUnitario * item.quantidade, 0)
  }

  pixExpirado(): boolean {
    if (!this.props.cobrancaExpiracaoEm) return false
    return new Date() > this.props.cobrancaExpiracaoEm
  }

  registrarCobrancaPix(
    gatewayId: string,
    pixCopiaECola: string,
    pixQrCodeBase64: string,
    expiracaoEm: Date,
  ): PedidoLoja {
    return new PedidoLoja({
      ...this.props,
      cobrancaGatewayId: gatewayId,
      cobrancaPixCopiaECola: pixCopiaECola,
      cobrancaPixQrCodeBase64: pixQrCodeBase64,
      cobrancaExpiracaoEm: expiracaoEm,
    })
  }

  registrarCobrancaCartao(
    gatewayId: string,
    cardInstallments: number,
    cardPaymentMethodId: string,
    valorCobrado?: number,
  ): PedidoLoja {
    return new PedidoLoja({
      ...this.props,
      cobrancaGatewayId: gatewayId,
      cardInstallments,
      cardPaymentMethodId,
      cobrancaValorCobrado: valorCobrado,
    })
  }

  confirmarPagamento(): PedidoLoja {
    if (this.props.status !== StatusPedidoLoja.AGUARDANDO_PAGAMENTO) {
      throw new Error('Apenas pedidos aguardando pagamento podem ser confirmados.')
    }
    return new PedidoLoja({ ...this.props, status: StatusPedidoLoja.PAGO })
  }

  avancarStatus(novoStatus: StatusPedidoLoja): PedidoLoja {
    const permitidos = TRANSICOES_PERMITIDAS[this.props.status] ?? []
    if (!permitidos.includes(novoStatus)) {
      throw new Error(`Transição ${this.props.status} → ${novoStatus} não é permitida.`)
    }
    return new PedidoLoja({ ...this.props, status: novoStatus })
  }

  /**
   * Cliente solicita cancelamento de pedido já pago.
   * O pedido fica em CANCELAMENTO_SOLICITADO aguardando aprovação do admin.
   */
  solicitarCancelamento(): PedidoLoja {
    if (this.props.status !== StatusPedidoLoja.PAGO) {
      throw new Error('Solicitação de cancelamento só é permitida para pedidos no status PAGO.')
    }
    return new PedidoLoja({ ...this.props, status: StatusPedidoLoja.CANCELAMENTO_SOLICITADO })
  }

  /**
   * Admin rejeita a solicitação de cancelamento — pedido volta para PAGO.
   */
  rejeitarCancelamento(): PedidoLoja {
    if (this.props.status !== StatusPedidoLoja.CANCELAMENTO_SOLICITADO) {
      throw new Error('Não há solicitação de cancelamento pendente para este pedido.')
    }
    return new PedidoLoja({ ...this.props, status: StatusPedidoLoja.PAGO })
  }

  cancelar(): PedidoLoja {
    // EM_PREPARACAO e CANCELAMENTO_SOLICITADO incluídos:
    // admin pode cancelar por falta de estoque, motivo operacional, ou ao aprovar o pedido de cancelamento do cliente
    const cancelaveis = [
      StatusPedidoLoja.AGUARDANDO_PAGAMENTO,
      StatusPedidoLoja.PAGO,
      StatusPedidoLoja.EM_PREPARACAO,
      StatusPedidoLoja.CANCELAMENTO_SOLICITADO,
    ]
    if (!cancelaveis.includes(this.props.status)) {
      throw new Error('Pedido não pode ser cancelado no status atual.')
    }
    return new PedidoLoja({ ...this.props, status: StatusPedidoLoja.CANCELADO })
  }
}
