import { OpcaoEntrega, StatusPedidoLoja, MetodoPagamentoPedidoLoja } from '@apa/shared'

// ─── Cliente ────────────────────────────────────────────────────────────────

export interface ClienteResponse {
  id: string
  nome: string
  email: string
  telefone?: string
  fotoUrl?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface SincronizarClienteResponse {
  cliente: ClienteResponse
  isNew: boolean
}

// ─── Endereço de entrega ─────────────────────────────────────────────────────

export interface EnderecoEntregaResponse {
  id: string
  clienteId: string
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  principal: boolean
}

// ─── Item de pedido loja ─────────────────────────────────────────────────────

export interface ItemPedidoLojaResponse {
  id: string
  pedidoLojaId: string
  produtoId: string
  nomeProduto: string
  precoUnitario: number
  quantidade: number
  campanhaCodigo?: string
}

// ─── Pedido loja ─────────────────────────────────────────────────────────────

export interface EnderecoEntregaSnapshotResponse {
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface PedidoLojaResponse {
  id: string
  clienteId: string
  status: StatusPedidoLoja
  opcaoEntrega: OpcaoEntrega
  enderecoEntregaId?: string
  /** Snapshot completo do endereço de entrega (quando houver) */
  enderecoEntrega?: EnderecoEntregaSnapshotResponse
  valorTotal: number
  observacoes?: string
  metodoPagamento?: MetodoPagamentoPedidoLoja
  itens: ItemPedidoLojaResponse[]
  cobrancaGatewayId?: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  cobrancaExpiracaoEm?: Date
  cobrancaValorCobrado?: number
  cardInstallments?: number
  cardPaymentMethodId?: string
  criadoEm: Date
}

export interface ListarPedidosResponse {
  pedidos: PedidoLojaResponse[]
  total: number
  paginas?: number
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export interface CheckoutResponse {
  pedidoId: string
  status: StatusPedidoLoja
  aprovado: boolean
  valorTotal: number
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  expiracaoEm?: Date
  cardInstallments?: number
  motivoRejeicao?: string
}

// ─── Configuração loja ───────────────────────────────────────────────────────

export interface ConfiguracaoLojaResponse {
  id: string
  ativaEntregaPrata: boolean
  ativaRetiradaLocal: boolean
  ativaACombinar: boolean
  ativaCorreios: boolean
  enderecoRetirada?: string
  horarioAtendimento?: string
  contatoEntrega?: string
  pixExpiracaoMinutos: number
  mensagemConfirmacao?: string
  aceitaPix: boolean
  aceitaCartao: boolean
  maxParcelas: number
  minValorParcela: number
  emailResponsavel?: string
}

export interface ConfiguracaoLojaPublicaResponse {
  ativaEntregaPrata: boolean
  ativaRetiradaLocal: boolean
  ativaACombinar: boolean
  enderecoRetirada?: string
  horarioAtendimento?: string
  contatoEntrega?: string
  aceitaPix: boolean
  aceitaCartao: boolean
  maxParcelas: number
  minValorParcela: number
}
