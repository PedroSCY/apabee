import { Inject, Injectable } from '@nestjs/common'
import {
  IEstoqueProdutoRepository,
  IListarProdutosComEstoqueUseCase,
  IProdutoRepository,
  ProdutoComEstoqueItem,
} from '@apa/core'
import { ESTOQUE_PRODUTO_REPOSITORY, PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class ListarProdutosComEstoqueUseCase implements IListarProdutosComEstoqueUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY)
    private readonly estoqueRepository: IEstoqueProdutoRepository,
  ) {}

  async execute(options?: { apenasPublicados?: boolean }): Promise<ProdutoComEstoqueItem[]> {
    const produtos = options?.apenasPublicados
      ? await this.produtoRepository.findAtivos()
      : await this.produtoRepository.findAll()

    const estoques = await Promise.all(
      produtos.map((p) => this.estoqueRepository.findByProduto(p.id)),
    )

    return produtos.map((produto, i) => ({
      produto,
      quantidadeEstoque: estoques[i]?.quantidadeDisponivel ?? 0,
    }))
  }
}
