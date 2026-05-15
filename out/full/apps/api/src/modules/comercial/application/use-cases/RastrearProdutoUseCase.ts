import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IItemPedidoRepository, ItemPedido } from '@apa/core'
import { ITEM_PEDIDO_REPOSITORY } from '../../comercial.tokens'

export interface ResultadoRastreamentoProduto {
  item: ItemPedido
  campanhaCodigo: string | null
}

@Injectable()
/** Dado o pedidoId, retorna os itens com seu campanhaCodigo para rastreabilidade (RN24). */
export class RastrearProdutoUseCase {
  constructor(
    @Inject(ITEM_PEDIDO_REPOSITORY)
    private readonly itemPedidoRepo: IItemPedidoRepository,
  ) {}

  async execute(pedidoId: string): Promise<ResultadoRastreamentoProduto[]> {
    const itens = await this.itemPedidoRepo.findByPedido(pedidoId)
    if (itens.length === 0) throw new NotFoundException('Nenhum item encontrado para o pedido')

    return itens.map(item => ({
      item,
      campanhaCodigo: item.campanhaCodigo ?? null,
    }))
  }
}
