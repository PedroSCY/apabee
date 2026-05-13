import { ItemPedido } from '../../entities/ItemPedido'

/** Repositório de itens de pedido. */
export interface IItemPedidoRepository {
  findByPedido(pedidoId: string): Promise<ItemPedido[]>
  saveMany(items: ItemPedido[]): Promise<ItemPedido[]>
}
