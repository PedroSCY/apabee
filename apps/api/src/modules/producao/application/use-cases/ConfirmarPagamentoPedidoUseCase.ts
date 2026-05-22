import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IPedidoAquisicaoRepository, PedidoAquisicao } from '@apa/core'
import { PEDIDO_AQUISICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ConfirmarPagamentoPedidoUseCase {
  constructor(
    @Inject(PEDIDO_AQUISICAO_REPOSITORY)
    private readonly pedidoRepo: IPedidoAquisicaoRepository,
  ) {}

  async execute(pedidoId: string): Promise<PedidoAquisicao> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException('Pedido não encontrado')
    if (pedido.pago) throw new BadRequestException('Pedido já está marcado como pago')

    return this.pedidoRepo.update(pedido.confirmarPagamento())
  }
}
