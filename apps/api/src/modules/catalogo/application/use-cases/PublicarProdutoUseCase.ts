import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IPublicarProdutoUseCase, IProdutoRepository, Produto } from '@apa/core'
import { PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class PublicarProdutoUseCase implements IPublicarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(produtoId: string): Promise<Produto> {
    const produto = await this.produtoRepository.findById(produtoId)
    if (!produto) throw new NotFoundException(`Produto ${produtoId} não encontrado.`)
    return this.produtoRepository.update(produto.publicar())
  }
}
