import { StatusPedido, TipoVenda } from '@apa/shared'

// ─── Item Pedido ──────────────────────────────────────────────────────────────

export interface ItemPedidoResponse {
  id: string
  produtoId: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

// ─── Pedido ───────────────────────────────────────────────────────────────────

export interface PedidoResponse {
  id: string
  clienteNome: string
  clienteEmail: string
  clienteTelefone?: string
  status: StatusPedido
  total: number
  criadoEm: Date
  itens: ItemPedidoResponse[]
}

// ─── Venda ────────────────────────────────────────────────────────────────────

export interface VendaResponse {
  id: string
  campanhaId?: string
  associadoId?: string
  tipo: TipoVenda
  volume: number
  valor: number
  data: Date
}
