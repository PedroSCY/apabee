import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICampanhaRepository, IItemAquisicaoRepository, IRemoverItemAquisicaoUseCase } from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY, ITEM_AQUISICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RemoverItemAquisicaoUseCase implements IRemoverItemAquisicaoUseCase {
  constructor(
    @Inject(ITEM_AQUISICAO_REPOSITORY)
    private readonly itemRepo: IItemAquisicaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const item = await this.itemRepo.findById(id)
    if (!item) throw new NotFoundException('Item de aquisição não encontrado')

    const campanha = await this.campanhaRepo.findById(item.campanhaId)
    if (campanha && campanha.status !== StatusCampanha.PLANEJADA && campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Itens só podem ser removidos de campanhas PLANEJADAS ou ATIVAS')

    await this.itemRepo.delete(id)
  }
}
