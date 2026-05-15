import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtualizarItemAquisicaoInput,
  IAtualizarItemAquisicaoUseCase,
  ICampanhaRepository,
  IItemAquisicaoRepository,
  ItemAquisicao,
} from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY, ITEM_AQUISICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class AtualizarItemAquisicaoUseCase implements IAtualizarItemAquisicaoUseCase {
  constructor(
    @Inject(ITEM_AQUISICAO_REPOSITORY)
    private readonly itemRepo: IItemAquisicaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(id: string, input: AtualizarItemAquisicaoInput): Promise<ItemAquisicao> {
    const item = await this.itemRepo.findById(id)
    if (!item) throw new NotFoundException('Item de aquisição não encontrado')

    const campanha = await this.campanhaRepo.findById(item.campanhaId)
    if (campanha && campanha.status !== StatusCampanha.PLANEJADA && campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Itens só podem ser alterados em campanhas PLANEJADAS ou ATIVAS')

    return this.itemRepo.update(item.atualizar(input))
  }
}
