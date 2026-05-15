import { Inject, Injectable } from '@nestjs/common'
import { IItemAquisicaoRepository, IListarItensAquisicaoUseCase, ItemAquisicao } from '@apa/core'
import { ITEM_AQUISICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarItensAquisicaoUseCase implements IListarItensAquisicaoUseCase {
  constructor(
    @Inject(ITEM_AQUISICAO_REPOSITORY)
    private readonly repository: IItemAquisicaoRepository,
  ) {}

  async execute(campanhaId: string): Promise<ItemAquisicao[]> {
    return this.repository.findByCampanha(campanhaId)
  }
}
