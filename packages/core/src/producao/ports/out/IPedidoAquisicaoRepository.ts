import { PedidoAquisicao } from '../../entities/PedidoAquisicao'

/** Repositório de pedidos individuais em campanhas de aquisição INDIVIDUAL. */
export interface IPedidoAquisicaoRepository {
  findById(id: string): Promise<PedidoAquisicao | null>
  findByCampanha(campanhaId: string): Promise<PedidoAquisicao[]>
  findByAssociadoECampanha(associadoId: string, campanhaId: string): Promise<PedidoAquisicao[]>
  save(pedido: PedidoAquisicao): Promise<PedidoAquisicao>
  update(pedido: PedidoAquisicao): Promise<PedidoAquisicao>
  delete(id: string): Promise<void>
}
