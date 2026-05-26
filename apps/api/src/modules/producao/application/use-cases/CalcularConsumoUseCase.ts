import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ConsumoMaterialPreview,
  ICalcularConsumoUseCase,
  IComposicaoProdutoRepository,
  IEstoqueMateriaPrimaRepository,
  IOrdemProducaoRepository,
  ITipoMateriaPrimaRepository,
} from '@apa/core'
import {
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  ORDEM_PRODUCAO_REPOSITORY,
  TIPO_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'

@Injectable()
/** Calcula o consumo real de pool para uma OrdemProducao sem executá-la (preview — RN16). */
export class CalcularConsumoUseCase implements ICalcularConsumoUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepo: IComposicaoProdutoRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepo: IEstoqueMateriaPrimaRepository,
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
  ) {}

  async execute(ordemId: string): Promise<ConsumoMaterialPreview[]> {
    const ordem = await this.ordemRepo.findById(ordemId)
    if (!ordem) throw new NotFoundException('Ordem de produção não encontrada')

    const composicoes = await this.composicaoRepo.findByProduto(ordem.produtoId)

    return Promise.all(composicoes.map(async comp => {
      const tipo = await this.tipoRepo.findById(comp.tipoMateriaPrimaId)
      const quantidadeNecessaria = comp.quantidadeNecessaria * ordem.quantidade
      const quantidade = ordem.calcularConsumoReal(quantidadeNecessaria)
      const estoque = await this.estoqueRepo.findByTipo(comp.tipoMateriaPrimaId)
      const suficiente = (estoque?.quantidadeDisponivel ?? 0) >= quantidade
      return {
        nome: tipo?.nome ?? comp.tipoMateriaPrimaId,
        quantidade,
        unidade: tipo?.unidade ?? '',
        suficiente,
      }
    }))
  }
}
