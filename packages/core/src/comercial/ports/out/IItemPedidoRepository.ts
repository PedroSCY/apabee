import { ItemPedido } from '../../entities/ItemPedido'

export interface IItemPedidoRepository {
  findByPedido(pedidoId: string): Promise<ItemPedido[]>
  saveMany(items: ItemPedido[]): Promise<ItemPedido[]>
}
