import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  CriarOrdemProducaoInput,
  ICampanhaRepository,
  IComposicaoProdutoRepository,
  ICriarOrdemProducaoUseCase,
  IEstoqueCampanhaRepository,
  IOrdemProducaoRepository,
  IProdutoRepository,
  OrdemProducao,
} from '@apa/core'
import { StatusCampanha, StatusOrdemProducao, TipoLote } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY, ESTOQUE_CAMPANHA_REPOSITORY, ORDEM_PRODUCAO_REPOSITORY } from '../../producao.tokens'

const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'
const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY'

@Injectable()
export class CriarOrdemProducaoUseCase implements ICriarOrdemProducaoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
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

    // D2: Produto já vinculado a outra campanha — estoques não podem ser misturados (RN24/RN25)
    const produto = await this.produtoRepo.findById(input.produtoId)
    if (!produto) throw new NotFoundException('Produto não encontrado')
    if (produto.campanhaId && produto.campanhaId !== input.campanhaId)
      throw new ConflictException(
        `Produto já vinculado à campanha "${produto.campanhaId}" — não é possível produzi-lo em campanhas distintas`,
      )

    // D5: Valida estoque da campanha antes de criar a ordem (fail-early — evita falha na execução)
    const composicoes = await this.composicaoRepo.findByProduto(input.produtoId)
    const perdaFator = 1 + (input.perdaPercentual ?? 0) / 100
    for (const comp of composicoes) {
      const necessario = comp.quantidadeNecessaria * input.quantidade * perdaFator
      const estoque = await this.estoqueCampanhaRepo.findByCampanhaETipo(
        input.campanhaId,
        comp.tipoMateriaPrimaId,
      )
      if (!estoque || estoque.quantidadeDisponivel < necessario)
        throw new BadRequestException(
          `Estoque insuficiente na campanha para o material "${comp.tipoMateriaPrimaId}". ` +
          `Necessário: ${necessario.toFixed(3)}, Disponível: ${estoque?.quantidadeDisponivel ?? 0}`,
        )
    }

    const ordem = new OrdemProducao({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      produtoId: input.produtoId,
      quantidade: input.quantidade,
      status: StatusOrdemProducao.PENDENTE,
      perdaPercentual: input.perdaPercentual ?? 0,
      materiaisConsumidos: [],
      criadoEm: new Date(),
    })
    return this.ordemRepo.save(ordem)
  }
}
