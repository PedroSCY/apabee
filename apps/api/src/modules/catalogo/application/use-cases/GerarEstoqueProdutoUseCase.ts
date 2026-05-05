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
    if (estoqueAtual) {
      return this.estoqueProdutoRepository.update(estoqueAtual.entrada(input.quantidade))
    }

    const novoEstoque = new EstoqueProduto({
      id: randomUUID(),
      produtoId: input.produtoId,
      quantidadeDisponivel: input.quantidade,
      atualizadoEm: new Date(),
    })
    return this.estoqueProdutoRepository.save(novoEstoque)
  }
}
