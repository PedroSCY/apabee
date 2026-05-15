import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICampanhaRepository, IItemPedidoRepository, ItemPedido } from '@apa/core'
import { CAMPANHA_REPOSITORY } from '../../producao.tokens'

const ITEM_PEDIDO_REPOSITORY = 'ITEM_PEDIDO_REPOSITORY'

export interface ResultadoRastreamentoCampanha {
  campanhaCodigo: string
  campanhaNome: string
  itens: ItemPedido[]
}

@Injectable()
/** Dado o código de uma campanha, retorna todos os ItemPedido vendidos com esse código (RN24 — rastreabilidade para recall). */
export class RastrearCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ITEM_PEDIDO_REPOSITORY)
    private readonly itemPedidoRepo: IItemPedidoRepository,
  ) {}

  async execute(campanhaCodigo: string): Promise<ResultadoRastreamentoCampanha> {
    const campanha = await this.campanhaRepo.findByCodigo(campanhaCodigo)
    if (!campanha) throw new NotFoundException(`Campanha com código ${campanhaCodigo} não encontrada`)

    const itens = await this.itemPedidoRepo.findByCampanhaCodigo(campanhaCodigo)

    return {
      campanhaCodigo,
      campanhaNome: campanha.nome,
      itens,
    }
  }
}
