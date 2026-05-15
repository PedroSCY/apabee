import { Pedido } from '../../entities/Pedido';

/** Repositório de pedidos. */
export interface IPedidoRepository {
  findById(id: string): Promise<Pedido | null>;
  findAll(): Promise<Pedido[]>;
  save(pedido: Pedido): Promise<Pedido>;
  update(pedido: Pedido): Promise<Pedido>;
}
