import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { IDeletarProdutoUseCase, IProdutoRepository } from '@apa/core'
import { PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class DeletarProdutoUseCase implements IDeletarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(produtoId: string): Promise<void> {
    const produto = await this.produtoRepository.findById(produtoId)
    if (!produto) throw new NotFoundException(`Produto ${produtoId} não encontrado.`)

    const statusPermitidos = ['RASCUNHO', 'ARQUIVADO']
    if (!statusPermitidos.includes(produto.status)) {
      throw new BadRequestException(
        `Apenas produtos em RASCUNHO ou ARQUIVADOS podem ser excluídos. Status atual: ${produto.status}.`,
      )
    }

    await this.produtoRepository.delete(produtoId)
  }
}
