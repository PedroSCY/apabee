import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IBuscarPedidoUseCase, IPedidoRepository, Pedido } from '@apa/core'
import { PEDIDO_REPOSITORY } from '../../comercial.tokens'

@Injectable()
export class BuscarPedidoUseCase implements IBuscarPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY) private readonly pedidoRepo: IPedidoRepository,
  ) {}

  async execute(id: string): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findById(id)
    if (!pedido) throw new NotFoundException(`Pedido ${id} não encontrado.`)
    return pedido
  }
}
