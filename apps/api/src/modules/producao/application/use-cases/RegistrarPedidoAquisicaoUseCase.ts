import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Campanha,
  ICampanhaRepository,
  IItemAquisicaoRepository,
  IPedidoAquisicaoRepository,
  ItemAquisicao,
  PedidoAquisicao,
} from '@apa/core'
import { DestinatarioCampanha, OrigemContribuicao, StatusCampanha } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  CAMPANHA_REPOSITORY,
  ITEM_AQUISICAO_REPOSITORY,
  PEDIDO_AQUISICAO_REPOSITORY,
} from '../../producao.tokens'

export interface RegistrarPedidoAquisicaoInput {
  campanhaId: string
  itemAquisicaoId: string
  associadoId?: string
  origem: OrigemContribuicao
  quantidade: number
}

@Injectable()
export class RegistrarPedidoAquisicaoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ITEM_AQUISICAO_REPOSITORY)
    private readonly itemRepo: IItemAquisicaoRepository,
    @Inject(PEDIDO_AQUISICAO_REPOSITORY)
    private readonly pedidoRepo: IPedidoAquisicaoRepository,
  ) {}

  async execute(input: RegistrarPedidoAquisicaoInput): Promise<PedidoAquisicao> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Pedidos só podem ser registrados em campanhas ATIVAS')
    if (!campanha.isAquisicaoIndividual)
      throw new BadRequestException('Esta campanha não é do tipo Aquisição Individual')

    if (input.origem === OrigemContribuicao.ASSOCIADO && !input.associadoId)
      throw new BadRequestException('associadoId é obrigatório para pedidos de associado')

    const item = await this.itemRepo.findById(input.itemAquisicaoId)
    if (!item) throw new NotFoundException('Item não encontrado')
    if (item.campanhaId !== input.campanhaId)
      throw new BadRequestException('Item não pertence a esta campanha')
    if (input.quantidade <= 0)
      throw new BadRequestException('Quantidade deve ser maior que zero')

    const valorTotal = input.quantidade * item.precoUnitario
    const pedido = new PedidoAquisicao({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      itemAquisicaoId: input.itemAquisicaoId,
      associadoId: input.associadoId,
      origem: input.origem,
      quantidade: input.quantidade,
      valorTotal,
      pago: false,
      entregue: false,
      criadoEm: new Date(),
    })

    await this.pedidoRepo.save(pedido)
    await this.itemRepo.update(item.adicionarPedido(input.quantidade))

    return pedido
  }
}
