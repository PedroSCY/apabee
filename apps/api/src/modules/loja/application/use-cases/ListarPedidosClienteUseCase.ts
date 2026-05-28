import { Inject, Injectable } from '@nestjs/common'
import { IPedidoLojaRepository, PedidoLoja } from '@apa/core'
import { PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class ListarPedidosClienteUseCase {
  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
  ) {}

  async execute(
    clienteId: string,
    page = 1,
    limit = 10,
  ): Promise<{ pedidos: PedidoLoja[]; total: number; paginas: number }> {
    const { pedidos, total } = await this.pedidoRepo.findByClienteId(clienteId, page, limit)
    return { pedidos, total, paginas: Math.ceil(total / limit) }
  }
}
