import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IConfirmarPedidoUseCase,
  IEstoqueProdutoRepository,
  IItemPedidoRepository,
  IPedidoRepository,
  Pedido,
} from '@apa/core'
import { ITEM_PEDIDO_REPOSITORY, PEDIDO_REPOSITORY } from '../../comercial.tokens'
import { ESTOQUE_PRODUTO_REPOSITORY } from '../../../catalogo/catalogo.tokens'

@Injectable()
export class ConfirmarPedidoUseCase implements IConfirmarPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY) private readonly pedidoRepo: IPedidoRepository,
    @Inject(ITEM_PEDIDO_REPOSITORY) private readonly itemRepo: IItemPedidoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY) private readonly estoqueRepo: IEstoqueProdutoRepository,
  ) {}

  async execute(pedidoId: string): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException(`Pedido ${pedidoId} não encontrado.`)

    const itens = await this.itemRepo.findByPedido(pedidoId)

    // RN04: baixa o estoque de cada item
    for (const item of itens) {
      const estoque = await this.estoqueRepo.findByProduto(item.produtoId)
      if (!estoque) throw new BadRequestException(`Estoque do produto ${item.produtoId} não encontrado.`)
      if (!estoque.temSaldo(item.quantidade)) {
        throw new BadRequestException(`Saldo insuficiente para confirmar o pedido (produto ${item.produtoId}).`)
      }
      await this.estoqueRepo.update(estoque.saida(item.quantidade))
    }

    return this.pedidoRepo.update(pedido.confirmar())
  }
}
