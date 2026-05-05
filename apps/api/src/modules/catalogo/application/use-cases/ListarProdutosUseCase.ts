import { Inject, Injectable } from '@nestjs/common'
import { Produto, IListarProdutosUseCase, IProdutoRepository } from '@apa/core'
import { PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class ListarProdutosUseCase implements IListarProdutosUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(options?: { apenasPublicados?: boolean }): Promise<Produto[]> {
    if (options?.apenasPublicados) return this.produtoRepository.findAtivos()
    return this.produtoRepository.findAll()
  }
}
