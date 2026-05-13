import { TipoVenda } from '@apa/shared'
import { Pedido } from '../../entities/Pedido'
import { Venda } from '../../entities/Venda'

// ── Inputs ────────────────────────────────────────────────────────────────────

/** Item individual de um pedido. */
export interface ItemPedidoInput {
  produtoId: string
  quantidade: number
}

/** Dados de entrada para criar um novo pedido. */
export interface CriarPedidoInput {
  clienteNome: string
  clienteEmail: string
  clienteTelefone?: string
  itens: ItemPedidoInput[]
}

/** Dados de entrada para registrar uma venda. */
export interface RegistrarVendaInput {
  loteProducaoId: string
  tipo: TipoVenda
  volume: number
  valor: number
  data: Date
  associadoId?: string
}

// ── Use Case Interfaces ───────────────────────────────────────────────────────

/** Use case: criar um novo pedido de cliente. */
export interface ICriarPedidoUseCase {
  execute(input: CriarPedidoInput): Promise<Pedido>
}

/** Use case: listar todos os pedidos. */
export interface IListarPedidosUseCase {
  execute(): Promise<Pedido[]>
}

/** Use case: buscar pedido por ID. */
export interface IBuscarPedidoUseCase {
  execute(id: string): Promise<Pedido>
}

/** Use case: confirmar um pedido (status CONFIRMADO). */
export interface IConfirmarPedidoUseCase {
  execute(pedidoId: string): Promise<Pedido>
}

/** Use case: cancelar um pedido. */
export interface ICancelarPedidoUseCase {
  execute(pedidoId: string): Promise<Pedido>
}

/** Use case: marcar pedido como enviado. */
export interface IMarcarEnviadoUseCase {
  execute(pedidoId: string): Promise<Pedido>
}

/** Use case: registrar uma venda (individual ou coletiva). */
export interface IRegistrarVendaUseCase {
  execute(input: RegistrarVendaInput): Promise<Venda>
}

/** Use case: listar vendas com filtros por lote e/ou associado. */
export interface IListarVendasUseCase {
  execute(options: { loteId?: string; associadoId?: string }): Promise<Venda[]>
}
