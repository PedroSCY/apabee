import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IArquivarProdutoUseCase, IProdutoRepository, Produto } from '@apa/core'
import { PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class ArquivarProdutoUseCase implements IArquivarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(produtoId: string): Promise<Produto> {
    const produto = await this.produtoRepository.findById(produtoId)
    if (!produto) throw new NotFoundException(`Produto ${produtoId} não encontrado.`)
    return this.produtoRepository.update(produto.arquivar())
  }
}
