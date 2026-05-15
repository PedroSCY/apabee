import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  ComposicaoProduto,
  CriarComposicaoInput,
  IComposicaoProdutoRepository,
  ICriarComposicaoProdutoUseCase,
  IProdutoRepository,
} from '@apa/core'
import { UnidadeMedida } from '@apa/shared'
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

    if (!Object.values(UnidadeMedida).includes(input.unidade as UnidadeMedida)) {
      throw new BadRequestException(`Unidade inválida: ${input.unidade}`)
    }

    const composicao = new ComposicaoProduto({
      id: randomUUID(),
      produtoId: input.produtoId,
      tipoMateriaPrimaId: input.tipoMateriaPrimaId,
      quantidadeNecessaria: input.quantidadeNecessaria,
      unidade: input.unidade as UnidadeMedida,
    })

    return this.composicaoRepository.save(composicao)
  }
}
