import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICancelarPedidoUseCase, IPedidoRepository, Pedido } from '@apa/core'
import { PEDIDO_REPOSITORY } from '../../comercial.tokens'

@Injectable()
export class CancelarPedidoUseCase implements ICancelarPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY) private readonly pedidoRepo: IPedidoRepository,
  ) {}

  async execute(pedidoId: string): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException(`Pedido ${pedidoId} não encontrado.`)
    return this.pedidoRepo.update(pedido.cancelar())
  }
}
