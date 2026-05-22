import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  EstoqueProduto,
  IComposicaoProdutoRepository,
  IEstoqueCampanhaRepository,
  IEstoqueProdutoRepository,
  IExecutarOrdemProducaoUseCase,
  IOrdemProducaoRepository,
  IProdutoRepository,
  MaterialConsumido,
  MovimentacaoEstoqueCampanha,
  OrdemProducao,
} from '@apa/core'
import { StatusOrdemProducao, TipoMovimentacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  ESTOQUE_CAMPANHA_REPOSITORY,
  ORDEM_PRODUCAO_REPOSITORY,
} from '../../producao.tokens'

const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'
const ESTOQUE_PRODUTO_REPOSITORY = 'ESTOQUE_PRODUTO_REPOSITORY'
const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY'

@Injectable()
/** Executa uma OrdemProducao: valida estoque da campanha, consome com perda (RN15, RN16), gera EstoqueProduto e vincula Produto à campanha (RN24). */
export class ExecutarOrdemProducaoUseCase implements IExecutarOrdemProducaoUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepo: IComposicaoProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY)
    private readonly estoqueProdutoRepo: IEstoqueProdutoRepository,
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepo: IProdutoRepository,
  ) {}

  async execute(id: string): Promise<OrdemProducao> {
    const ordem = await this.ordemRepo.findById(id)
    if (!ordem) throw new NotFoundException('Ordem de produção não encontrada')
    if (ordem.status !== StatusOrdemProducao.PENDENTE)
      throw new BadRequestException('Apenas ordens PENDENTES podem ser executadas')

    const composicoes = await this.composicaoRepo.findByProduto(ordem.produtoId)
    if (composicoes.length === 0)
      throw new BadRequestException('Produto não possui composição de matéria-prima definida')

    // Valida disponibilidade no estoque da campanha e calcula consumo real com perda (RN16)
    const materiaisConsumidos: MaterialConsumido[] = []
    for (const comp of composicoes) {
      const quantidadeBase = comp.quantidadeNecessaria * ordem.quantidade
      const quantidadeComPerda = ordem.calcularConsumoReal(quantidadeBase)

      const estoque = await this.estoqueCampanhaRepo.findByCampanhaETipo(
        ordem.campanhaId,
        comp.tipoMateriaPrimaId,
      )
      if (!estoque || estoque.quantidadeDisponivel < quantidadeComPerda)
        throw new BadRequestException(
          `Estoque insuficiente na campanha. Necessário: ${quantidadeComPerda.toFixed(3)}, Disponível: ${estoque?.quantidadeDisponivel ?? 0}`,
        )

      materiaisConsumidos.push({
        tipoMateriaPrimaId: comp.tipoMateriaPrimaId,
        quantidade: quantidadeComPerda,
        unidade: comp.unidade,
      })
    }

    // Consome o estoque da campanha (RN15)
    for (const material of materiaisConsumidos) {
      const estoque = (await this.estoqueCampanhaRepo.findByCampanhaETipo(
        ordem.campanhaId,
        material.tipoMateriaPrimaId,
      ))!
      const atualizado = await this.estoqueCampanhaRepo.update(estoque.saida(material.quantidade))
      await this.estoqueCampanhaRepo.salvarMovimentacao(
        new MovimentacaoEstoqueCampanha({
          id: randomUUID(),
          estoqueCampanhaId: atualizado.id,
          tipo: TipoMovimentacao.SAIDA,
          quantidade: material.quantidade,
          referenciaId: id,
          criadoEm: new Date(),
        }),
      )
    }

    // RN15: gera entrada no EstoqueProduto após consumir estoque da campanha
    const estoqueAtual = await this.estoqueProdutoRepo.findByProduto(ordem.produtoId)
    if (estoqueAtual) {
      await this.estoqueProdutoRepo.update(estoqueAtual.entrada(ordem.quantidade))
    } else {
      await this.estoqueProdutoRepo.save(
        new EstoqueProduto({ id: randomUUID(), produtoId: ordem.produtoId, quantidadeDisponivel: ordem.quantidade, atualizadoEm: new Date() }),
      )
    }

    // RN24: vincula Produto à campanha para rastreabilidade em ItemPedido.campanhaCodigo
    const produto = await this.produtoRepo.findById(ordem.produtoId)
    if (produto && !produto.campanhaId) {
      await this.produtoRepo.update(produto.comCampanha(ordem.campanhaId))
    }

    return this.ordemRepo.update(
      ordem.iniciarExecucao().concluir(ordem.quantidade, materiaisConsumidos),
    )
  }
}
