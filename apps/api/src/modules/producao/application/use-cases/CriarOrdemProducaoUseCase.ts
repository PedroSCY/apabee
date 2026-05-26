import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  CriarOrdemProducaoInput,
  ICampanhaRepository,
  IComposicaoProdutoRepository,
  ICriarOrdemProducaoUseCase,
  IOrdemProducaoRepository,
  IProdutoRepository,
  OrdemProducao,
} from '@apa/core'
import { StatusCampanha, StatusOrdemProducao, TipoLote } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY, ORDEM_PRODUCAO_REPOSITORY } from '../../producao.tokens'

const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'
const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY'

@Injectable()
export class CriarOrdemProducaoUseCase implements ICriarOrdemProducaoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepo: IComposicaoProdutoRepository,
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepo: IProdutoRepository,
  ) {}

  async execute(input: CriarOrdemProducaoInput): Promise<OrdemProducao> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.tipo !== TipoLote.PRODUCAO)
      throw new BadRequestException('Ordens de produção só são permitidas em campanhas de PRODUCAO')
    if (campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Ordens de produção só podem ser criadas em campanhas ATIVAS')
    if (input.quantidade <= 0)
      throw new BadRequestException('Quantidade deve ser maior que zero')

    const produto = await this.produtoRepo.findById(input.produtoId)
    if (!produto) throw new NotFoundException('Produto não encontrado')

    const composicoes = await this.composicaoRepo.findByProduto(input.produtoId)
    if (composicoes.length === 0)
      throw new BadRequestException('Produto não possui composição de matéria-prima definida')

    const ordem = new OrdemProducao({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      produtoId: input.produtoId,
      quantidade: input.quantidade,
      status: StatusOrdemProducao.RASCUNHO,
      perdaPercentual: input.perdaPercentual ?? 0,
      materiaisConsumidos: [],
      criadoEm: new Date(),
    })
    return this.ordemRepo.save(ordem)
  }
}
