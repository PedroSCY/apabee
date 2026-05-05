import { TipoVenda } from '@apa/shared'
import { Pedido } from '../../entities/Pedido'
import { Venda } from '../../entities/Venda'

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface ItemPedidoInput {
  produtoId: string
  quantidade: number
}

export interface CriarPedidoInput {
  clienteNome: string
  clienteEmail: string
  clienteTelefone?: string
  itens: ItemPedidoInput[]
}

export interface RegistrarVendaInput {
  loteProducaoId: string
  tipo: TipoVenda
  volume: number
  valor: number
  data: Date
  associadoId?: string
}

// ── Use Case Interfaces ───────────────────────────────────────────────────────

export interface ICriarPedidoUseCase {
  execute(input: CriarPedidoInput): Promise<Pedido>
}

export interface IListarPedidosUseCase {
  execute(): Promise<Pedido[]>
}

export interface IBuscarPedidoUseCase {
  execute(id: string): Promise<Pedido>
}

export interface IConfirmarPedidoUseCase {
  execute(pedidoId: string): Promise<Pedido>
}

export interface ICancelarPedidoUseCase {
  execute(pedidoId: string): Promise<Pedido>
}

export interface IMarcarEnviadoUseCase {
  execute(pedidoId: string): Promise<Pedido>
}

export interface IRegistrarVendaUseCase {
  execute(input: RegistrarVendaInput): Promise<Venda>
}

export interface IListarVendasUseCase {
  execute(options: { loteId?: string; associadoId?: string }): Promise<Venda[]>
}
