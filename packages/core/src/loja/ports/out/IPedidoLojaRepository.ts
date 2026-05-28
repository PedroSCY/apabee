import { StatusPedidoLoja, OpcaoEntrega } from '@apa/shared'
import { PedidoLoja } from '../../entities/PedidoLoja'

export interface FindPedidosLojaParams {
  status?: StatusPedidoLoja
  clienteEmail?: string
  opcaoEntrega?: OpcaoEntrega
  dataInicio?: Date
  dataFim?: Date
  page?: number
  limit?: number
}

export interface IPedidoLojaRepository {
  findById(id: string): Promise<PedidoLoja | null>
  findByClienteId(clienteId: string, page?: number, limit?: number): Promise<{ pedidos: PedidoLoja[]; total: number }>
  findAll(params?: FindPedidosLojaParams): Promise<{ pedidos: PedidoLoja[]; total: number }>
  findByCobrancaGatewayId(gatewayId: string): Promise<PedidoLoja | null>
  save(pedido: PedidoLoja): Promise<PedidoLoja>
  update(pedido: PedidoLoja): Promise<PedidoLoja>
}
