import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  CriarMetaProducaoInput,
  ICampanhaRepository,
  ICriarMetaProducaoUseCase,
  IMetaProducaoRepository,
  IProdutoRepository,
  IComposicaoProdutoRepository,
  MetaProducao,
} from '@apa/core'
import { StatusCampanha, TipoLote } from '@apa/shared'
import {
  CAMPANHA_REPOSITORY,
  META_PRODUCAO_REPOSITORY,
} from '../../producao.tokens'

const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY'
const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'

@Injectable()
export class CriarMetaProducaoUseCase implements ICriarMetaProducaoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(META_PRODUCAO_REPOSITORY)
    private readonly metaRepo: IMetaProducaoRepository,
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepo: IProdutoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepo: IComposicaoProdutoRepository,
  ) {}

  async execute(input: CriarMetaProducaoInput): Promise<MetaProducao> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.tipo !== TipoLote.PRODUCAO)
      throw new BadRequestException('Metas de produção só são permitidas em campanhas de PRODUÇÃO')
    if (campanha.status !== StatusCampanha.PLANEJADA)
      throw new BadRequestException('Metas só podem ser definidas em campanhas com status PLANEJADA')

    const produto = await this.produtoRepo.findById(input.produtoId)
    if (!produto) throw new NotFoundException('Produto não encontrado')

    const composicoes = await this.composicaoRepo.findByProduto(input.produtoId)
    if (composicoes.length === 0)
      throw new BadRequestException('Produto não possui composição de matéria-prima — defina os ingredientes antes de planejar a produção')

    const existente = await this.metaRepo.findByCampanhaEProduto(input.campanhaId, input.produtoId)
    if (existente)
      throw new ConflictException('Já existe uma meta de produção para este produto nesta campanha')

    const meta = new MetaProducao({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      produtoId: input.produtoId,
      quantidadePlanejada: input.quantidadePlanejada,
      perdaPercentualEstimada: input.perdaPercentualEstimada ?? 5,
      criadoEm: new Date(),
    })

    return this.metaRepo.save(meta)
  }
}
