import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ComposicaoProduto,
  EstoqueProduto,
  IBuscarProdutoUseCase,
  IComposicaoProdutoRepository,
  IEstoqueProdutoRepository,
  IProdutoRepository,
  Produto,
} from '@apa/core'
import {
  COMPOSICAO_PRODUTO_REPOSITORY,
  ESTOQUE_PRODUTO_REPOSITORY,
  PRODUTO_REPOSITORY,
} from '../../catalogo.tokens'

@Injectable()
export class BuscarProdutoUseCase implements IBuscarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY)
    private readonly estoqueRepository: IEstoqueProdutoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepository: IComposicaoProdutoRepository,
  ) {}

  async execute(id: string): Promise<{
    produto: Produto
    estoque: EstoqueProduto | null
    composicoes: ComposicaoProduto[]
  }> {
    const produto = await this.produtoRepository.findById(id)
    if (!produto) throw new NotFoundException(`Produto ${id} não encontrado.`)

    const [estoque, composicoes] = await Promise.all([
      this.estoqueRepository.findByProduto(id),
      this.composicaoRepository.findByProduto(id),
    ])

    return { produto, estoque, composicoes }
  }
}
