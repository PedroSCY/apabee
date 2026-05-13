import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IComposicaoProdutoRepository, IRemoverComposicaoProdutoUseCase } from '@apa/core'
import { COMPOSICAO_PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class RemoverComposicaoProdutoUseCase implements IRemoverComposicaoProdutoUseCase {
  constructor(
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepository: IComposicaoProdutoRepository,
  ) {}

  async execute(composicaoId: string): Promise<void> {
    try {
      await this.composicaoRepository.delete(composicaoId)
    } catch {
      throw new NotFoundException(`Composição ${composicaoId} não encontrada.`)
    }
  }
}
