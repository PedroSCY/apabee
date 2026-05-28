import { Inject, Injectable } from '@nestjs/common'
import { FindPedidosLojaParams, IPedidoLojaRepository, PedidoLoja } from '@apa/core'
import { PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class ListarTodosPedidosLojaUseCase {
  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
  ) {}

  async execute(params?: FindPedidosLojaParams): Promise<{ pedidos: PedidoLoja[]; total: number }> {
    return this.pedidoRepo.findAll(params)
  }
}
