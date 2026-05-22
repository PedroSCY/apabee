import { ItemPedido } from '../../entities/ItemPedido'

/** Repositório de itens de pedido. */
export interface IItemPedidoRepository {
  findByPedido(pedidoId: string): Promise<ItemPedido[]>
  findByCampanhaCodigo(campanhaCodigo: string): Promise<ItemPedido[]>
  saveMany(items: ItemPedido[]): Promise<ItemPedido[]>
  /** Soma quantidade de itens de pedidos ENTREGUES para uma campanha (RN19 FIXO_POR_UNIDADE). */
  sumQuantidadeEntregue(campanhaCodigo: string): Promise<number>
}
