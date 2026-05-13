import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IComposicaoProdutoRepository,
  IConsultarCapacidadeUseCase,
  ConsultarCapacidadeInput,
  ConsultarCapacidadeResponse,
  IProdutoRepository,
  IColheitaRepository,
} from '@apa/core'
import { COMPOSICAO_PRODUTO_REPOSITORY, PRODUTO_REPOSITORY } from '../../catalogo.tokens'
import { COLHEITA_REPOSITORY } from '../../../producao/producao.tokens'

@Injectable()
/** Consulta a capacidade máxima de produção de um produto a partir de um lote. */
export class ConsultarCapacidadeUseCase implements IConsultarCapacidadeUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepository: IComposicaoProdutoRepository,
    @Inject(COLHEITA_REPOSITORY)
    private readonly colheitaRepository: IColheitaRepository,
  ) {}

  /** Executa o cálculo com base na composição do produto e volume disponível no lote. */
  async execute({ produtoId, loteId }: ConsultarCapacidadeInput): Promise<ConsultarCapacidadeResponse> {
    const produto = await this.produtoRepository.findById(produtoId)
    if (!produto) throw new NotFoundException(`Produto ${produtoId} não encontrado.`)

    const composicoes = await this.composicaoRepository.findByProduto(produtoId)
    if (!composicoes.length) {
      throw new BadRequestException('Produto não possui composição definida.')
    }

    const colheitas = await this.colheitaRepository.findByLote(loteId)

    // Soma o volume por tipo de matéria-prima disponível no lote
    const volumePorTipo = new Map<string, number>()
    for (const c of colheitas) {
      volumePorTipo.set(c.tipoMateriaPrimaId, (volumePorTipo.get(c.tipoMateriaPrimaId) ?? 0) + c.volume)
    }

    // Para cada ingrediente da composição, calcula quantas unidades o lote comporta
    const capacidades: number[] = composicoes.map((comp) => {
      const volumeDisponivel = volumePorTipo.get(comp.tipoMateriaPrimaId) ?? 0
      if (volumeDisponivel === 0) return 0
      return Math.floor(volumeDisponivel / comp.quantidadeNecessaria)
    })

    const capacidadeMaxima = capacidades.length > 0 ? Math.min(...capacidades) : 0

    return { capacidadeMaxima, loteId }
  }
}
