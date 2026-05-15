import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  EstoqueProduto,
  IComposicaoProdutoRepository,
  IEstoqueMateriaPrimaRepository,
  IEstoqueProdutoRepository,
  IGerarEstoqueProdutoUseCase,
  GerarEstoqueInput,
  IProdutoRepository,
  MovimentacaoEstoque,
} from '@apa/core'
import { TipoMovimentacao } from '@apa/shared'
import {
  COMPOSICAO_PRODUTO_REPOSITORY,
  ESTOQUE_PRODUTO_REPOSITORY,
  PRODUTO_REPOSITORY,
} from '../../catalogo.tokens'
import { ESTOQUE_MATERIA_PRIMA_REPOSITORY } from '../../../producao/producao.tokens'

@Injectable()
/** Gera estoque de produto consumindo matéria-prima conforme composição (RN05). */
export class GerarEstoqueProdutoUseCase implements IGerarEstoqueProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY)
    private readonly estoqueProdutoRepository: IEstoqueProdutoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepository: IComposicaoProdutoRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueMateriaPrimaRepository: IEstoqueMateriaPrimaRepository,
  ) {}

  /** Executa a validação de saldo, consumo de insumos e atualização do estoque final. */
  async execute(input: GerarEstoqueInput): Promise<EstoqueProduto> {
    const produto = await this.produtoRepository.findById(input.produtoId)
    if (!produto) throw new NotFoundException(`Produto ${input.produtoId} não encontrado.`)

    const composicoes = await this.composicaoRepository.findByProduto(input.produtoId)
    if (!composicoes.length) {
      throw new BadRequestException('Produto não possui composição definida (RN05).')
    }

    // RN05: verifica e consome matéria-prima para cada componente
    for (const comp of composicoes) {
      const estoqueMP = await this.estoqueMateriaPrimaRepository.findByTipo(comp.tipoMateriaPrimaId)
      if (!estoqueMP) {
        throw new BadRequestException(`Estoque de matéria-prima (tipo ${comp.tipoMateriaPrimaId}) não encontrado.`)
      }
      const consumo = comp.consumoTotal(input.quantidade)
      if (!comp.verificarDisponibilidade(estoqueMP.quantidadeDisponivel, input.quantidade)) {
        throw new BadRequestException(
          `Saldo insuficiente de matéria-prima (tipo ${comp.tipoMateriaPrimaId}). Necessário: ${consumo}, disponível: ${estoqueMP.quantidadeDisponivel}.`,
        )
      }
      const estoqueAtualizado = estoqueMP.saida(consumo)
      const mov = new MovimentacaoEstoque({
        id: randomUUID(),
        estoqueId: estoqueMP.id,
        tipo: TipoMovimentacao.SAIDA,
        quantidade: consumo,
        referenciaId: input.produtoId,
        criadoEm: new Date(),
      })
      await this.estoqueMateriaPrimaRepository.update(estoqueAtualizado)
      await this.estoqueMateriaPrimaRepository.salvarMovimentacao(mov)
    }

    // Atualiza ou cria estoque do produto final
    const estoqueAtual = await this.estoqueProdutoRepository.findByProduto(input.produtoId)
    let estoque: EstoqueProduto
    if (estoqueAtual) {
      estoque = await this.estoqueProdutoRepository.update(estoqueAtual.entrada(input.quantidade))
    } else {
      estoque = await this.estoqueProdutoRepository.save(
        new EstoqueProduto({
          id: randomUUID(),
          produtoId: input.produtoId,
          quantidadeDisponivel: input.quantidade,
          atualizadoEm: new Date(),
        }),
      )
    }

    // Vincula a campanha de origem ao produto quando informada
    if (input.campanhaId) {
      await this.produtoRepository.update(produto.comCampanha(input.campanhaId))
    }

    return estoque
  }
}
