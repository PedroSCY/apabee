import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  ComposicaoProduto,
  CriarComposicaoInput,
  IComposicaoProdutoRepository,
  ICriarComposicaoProdutoUseCase,
  IProdutoRepository,
} from '@apa/core'
import { COMPOSICAO_PRODUTO_REPOSITORY, PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class AdicionarComposicaoProdutoUseCase implements ICriarComposicaoProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepository: IComposicaoProdutoRepository,
  ) {}

  async execute(input: CriarComposicaoInput): Promise<ComposicaoProduto> {
    const produto = await this.produtoRepository.findById(input.produtoId)
    if (!produto) throw new NotFoundException(`Produto ${input.produtoId} não encontrado.`)

    const composicao = new ComposicaoProduto({
      id: randomUUID(),
      produtoId: input.produtoId,
      tipoMateriaPrimaId: input.tipoMateriaPrimaId,
      quantidadeNecessaria: input.quantidadeNecessaria,
    })

    return this.composicaoRepository.save(composicao)
  }
}
