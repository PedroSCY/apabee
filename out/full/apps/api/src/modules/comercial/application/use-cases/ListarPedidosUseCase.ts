import { Inject, Injectable } from '@nestjs/common'
import { IListarPedidosUseCase, IPedidoRepository, Pedido } from '@apa/core'
import { PEDIDO_REPOSITORY } from '../../comercial.tokens'

@Injectable()
export class ListarPedidosUseCase implements IListarPedidosUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY) private readonly pedidoRepo: IPedidoRepository,
  ) {}

  async execute(): Promise<Pedido[]> {
    return this.pedidoRepo.findAll()
  }
}
