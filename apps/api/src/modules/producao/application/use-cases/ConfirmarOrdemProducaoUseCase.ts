import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ConfirmacaoAtomicaParams,
  ConfirmarOrdemProducaoInput,
  EstoqueCampanha,
  EstoqueMateriaPrima,
  IComposicaoProdutoRepository,
  IConfirmarOrdemProducaoUseCase,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  IEstoqueProdutoRepository,
  IOrdemProducaoRepository,
  IProdutoRepository,
  MaterialConsumido,
  MovimentacaoEstoque,
  MovimentacaoEstoqueCampanha,
  OrdemProducao,
} from '@apa/core'
import { StatusOrdemProducao, TipoMovimentacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  ESTOQUE_CAMPANHA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  ORDEM_PRODUCAO_REPOSITORY,
} from '../../producao.tokens'

const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'
const ESTOQUE_PRODUTO_REPOSITORY = 'ESTOQUE_PRODUTO_REPOSITORY'
const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY'

@Injectable()
/** Confirma uma OrdemProducao em RASCUNHO: valida e consome estoque da campanha (com perda), credita EstoqueProduto, devolve sobras ao pool e vincula Produto à campanha (RN24). Todas as escritas são atômicas via salvarConfirmacaoAtomico. */
export class ConfirmarOrdemProducaoUseCase implements IConfirmarOrdemProducaoUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoquePoolRepo: IEstoqueMateriaPrimaRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepo: IComposicaoProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY)
    private readonly estoqueProdutoRepo: IEstoqueProdutoRepository,
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepo: IProdutoRepository,
  ) {}

  async execute(input: ConfirmarOrdemProducaoInput): Promise<OrdemProducao> {
    const ordem = await this.ordemRepo.findById(input.ordemId)
    if (!ordem) throw new NotFoundException('Ordem de produção não encontrada')
    if (ordem.status !== StatusOrdemProducao.RASCUNHO)
      throw new BadRequestException('Apenas ordens em RASCUNHO podem ser confirmadas')
    if (input.quantidadeReal <= 0)
      throw new BadRequestException('Quantidade real deve ser maior que zero')

    const composicoes = await this.composicaoRepo.findByProduto(ordem.produtoId)
    if (composicoes.length === 0)
      throw new BadRequestException('Produto não possui composição de matéria-prima definida')

    // Valida estoque e computa materiais consumidos + estoques atualizados em memória (sem escrita)
    const materiaisConsumidos: MaterialConsumido[] = []
    const estoquesAtualizados: EstoqueCampanha[] = []
    const movimentacoesCampanha: MovimentacaoEstoqueCampanha[] = []

    for (const comp of composicoes) {
      const quantidadeBase = comp.quantidadeNecessaria * input.quantidadeReal
      const quantidadeComPerda = ordem.calcularConsumoReal(quantidadeBase)

      const estoque = await this.estoqueCampanhaRepo.findByCampanhaETipo(
        ordem.campanhaId,
        comp.tipoMateriaPrimaId,
      )
      if (!estoque || estoque.quantidadeDisponivel < quantidadeComPerda)
        throw new BadRequestException(
          `Estoque insuficiente na campanha. Necessário: ${quantidadeComPerda.toFixed(3)}, Disponível: ${estoque?.quantidadeDisponivel ?? 0}`,
        )

      materiaisConsumidos.push({ tipoMateriaPrimaId: comp.tipoMateriaPrimaId, quantidade: quantidadeComPerda })
      estoquesAtualizados.push(estoque.saida(quantidadeComPerda))
      movimentacoesCampanha.push(
        new MovimentacaoEstoqueCampanha({
          id: randomUUID(),
          estoqueCampanhaId: estoque.id,
          tipo: TipoMovimentacao.SAIDA,
          quantidade: quantidadeComPerda,
          referenciaId: input.ordemId,
          criadoEm: new Date(),
        }),
      )
    }

    // Computa devolução de sobras ao pool
    let estoquePoolAtualizado: EstoqueMateriaPrima | undefined
    let movimentacaoPool: MovimentacaoEstoque | undefined
    if (input.sobrasRecuperadas && input.sobrasRecuperadas > 0 && composicoes.length > 0) {
      const tipoId = composicoes[0]!.tipoMateriaPrimaId
      const estoquePool = await this.estoquePoolRepo.findByTipo(tipoId)
      if (estoquePool) {
        estoquePoolAtualizado = estoquePool.entrada(input.sobrasRecuperadas)
        movimentacaoPool = new MovimentacaoEstoque({
          id: randomUUID(),
          estoqueId: estoquePool.id,
          tipo: TipoMovimentacao.ENTRADA,
          quantidade: input.sobrasRecuperadas,
          referenciaId: input.ordemId,
          criadoEm: new Date(),
        })
      }
    }

    // Computa novo saldo do EstoqueProduto
    const estoqueAtual = await this.estoqueProdutoRepo.findByProduto(ordem.produtoId)
    const estoqueProduto: ConfirmacaoAtomicaParams['estoqueProduto'] = {
      id: estoqueAtual?.id,
      produtoId: ordem.produtoId,
      quantidadeNova: (estoqueAtual?.quantidadeDisponivel ?? 0) + input.quantidadeReal,
    }

    // RN24: sempre atualiza vínculo Produto→Campanha (rastreabilidade da campanha mais recente)
    const produto = await this.produtoRepo.findById(ordem.produtoId)
    const vincularProdutoCampanha = produto
      ? { produtoId: ordem.produtoId, campanhaId: ordem.campanhaId }
      : undefined

    return this.ordemRepo.salvarConfirmacaoAtomico({
      ordemConfirmada: ordem.confirmar(
        input.quantidadeReal,
        materiaisConsumidos,
        input.sobrasRecuperadas,
        input.observacao,
      ),
      estoquesAtualizados,
      movimentacoesCampanha,
      estoquePoolAtualizado,
      movimentacaoPool,
      estoqueProduto,
      vincularProdutoCampanha,
    })
  }
}
