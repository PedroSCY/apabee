import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  EstoqueProduto,
  IComposicaoProdutoRepository,
  IEstoqueMateriaPrimaRepository,
  IEstoqueProdutoRepository,
  IExecutarOrdemProducaoUseCase,
  IOrdemProducaoRepository,
  MaterialConsumido,
  MovimentacaoEstoque,
  OrdemProducao,
} from '@apa/core'
import { StatusOrdemProducao, TipoMovimentacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  ORDEM_PRODUCAO_REPOSITORY,
} from '../../producao.tokens'

const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'
const ESTOQUE_PRODUTO_REPOSITORY = 'ESTOQUE_PRODUTO_REPOSITORY'

@Injectable()
/** Executa uma OrdemProducao: valida estoque, consome pool com perda (RN15, RN16), gera EstoqueProduto. */
export class ExecutarOrdemProducaoUseCase implements IExecutarOrdemProducaoUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepo: IEstoqueMateriaPrimaRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepo: IComposicaoProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY)
    private readonly estoqueProdutoRepo: IEstoqueProdutoRepository,
  ) {}

  async execute(id: string): Promise<OrdemProducao> {
    const ordem = await this.ordemRepo.findById(id)
    if (!ordem) throw new NotFoundException('Ordem de produção não encontrada')
    if (ordem.status !== StatusOrdemProducao.PENDENTE)
      throw new BadRequestException('Apenas ordens PENDENTES podem ser executadas')

    const composicoes = await this.composicaoRepo.findByProduto(ordem.produtoId)
    if (composicoes.length === 0)
      throw new BadRequestException('Produto não possui composição de matéria-prima definida')

    // Valida disponibilidade e calcula consumo real com perda (RN16)
    const materiaisConsumidos: MaterialConsumido[] = []
    for (const comp of composicoes) {
      const quantidadeBase = comp.quantidadeNecessaria * ordem.quantidade
      const quantidadeComPerda = ordem.calcularConsumoReal(quantidadeBase)

      const estoque = await this.estoqueRepo.findByTipo(comp.tipoMateriaPrimaId)
      if (!estoque || estoque.quantidadeDisponivel < quantidadeComPerda)
        throw new BadRequestException(
          `Estoque insuficiente. Necessário: ${quantidadeComPerda.toFixed(3)}, Disponível: ${estoque?.quantidadeDisponivel ?? 0}`,
        )

      materiaisConsumidos.push({
        tipoMateriaPrimaId: comp.tipoMateriaPrimaId,
        quantidade: quantidadeComPerda,
        unidade: comp.unidade,
      })
    }

    // Consome o pool (RN15)
    for (const material of materiaisConsumidos) {
      const estoque = (await this.estoqueRepo.findByTipo(material.tipoMateriaPrimaId))!
      const atualizado = await this.estoqueRepo.update(estoque.saida(material.quantidade))
      await this.estoqueRepo.salvarMovimentacao(
        new MovimentacaoEstoque({
          id: randomUUID(),
          estoqueId: atualizado.id,
          tipo: TipoMovimentacao.SAIDA,
          quantidade: material.quantidade,
          referenciaId: id,
          criadoEm: new Date(),
        }),
      )
    }

    // RN15: gera entrada no EstoqueProduto após consumir o pool
    const estoqueAtual = await this.estoqueProdutoRepo.findByProduto(ordem.produtoId)
    if (estoqueAtual) {
      await this.estoqueProdutoRepo.update(estoqueAtual.entrada(ordem.quantidade))
    } else {
      await this.estoqueProdutoRepo.save(
        new EstoqueProduto({ id: randomUUID(), produtoId: ordem.produtoId, quantidadeDisponivel: ordem.quantidade, atualizadoEm: new Date() }),
      )
    }

    return this.ordemRepo.update(
      ordem.iniciarExecucao().concluir(ordem.quantidade, materiaisConsumidos),
    )
  }
}
