import { Inject, Injectable } from '@nestjs/common'
import {
  IComposicaoProdutoRepository,
  IEstoqueCampanhaRepository,
  IListarMetasProducaoUseCase,
  IMetaProducaoRepository,
  IProdutoRepository,
  ITipoMateriaPrimaRepository,
  MaterialNecessario,
  MetaProducaoDetalhe,
} from '@apa/core'
import {
  ESTOQUE_CAMPANHA_REPOSITORY,
  META_PRODUCAO_REPOSITORY,
  TIPO_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY'
const COMPOSICAO_PRODUTO_REPOSITORY = 'COMPOSICAO_PRODUTO_REPOSITORY'

@Injectable()
export class ListarMetasProducaoUseCase implements IListarMetasProducaoUseCase {
  constructor(
    @Inject(META_PRODUCAO_REPOSITORY)
    private readonly metaRepo: IMetaProducaoRepository,
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepo: IProdutoRepository,
    @Inject(COMPOSICAO_PRODUTO_REPOSITORY)
    private readonly composicaoRepo: IComposicaoProdutoRepository,
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
  ) {}

  async execute(campanhaId: string): Promise<MetaProducaoDetalhe[]> {
    const metas = await this.metaRepo.findByCampanha(campanhaId)

    return Promise.all(
      metas.map(async (meta) => {
        const produto = await this.produtoRepo.findById(meta.produtoId)
        const composicoes = await this.composicaoRepo.findByProduto(meta.produtoId)

        const materiaisNecessarios: MaterialNecessario[] = await Promise.all(
          composicoes.map(async (comp) => {
            const tipo = await this.tipoRepo.findById(comp.tipoMateriaPrimaId)
            const estoque = await this.estoqueCampanhaRepo.findByCampanhaETipo(
              campanhaId,
              comp.tipoMateriaPrimaId,
            )
            const quantidadeNecessaria = meta.consumoEstimado(comp.quantidadeNecessaria)
            const quantidadeDisponivel = estoque?.quantidadeDisponivel ?? 0
            return {
              tipoMateriaPrimaId: comp.tipoMateriaPrimaId,
              nomeTipo: tipo?.nome ?? comp.tipoMateriaPrimaId,
              unidade: tipo?.unidade ?? '',
              quantidadeNecessaria,
              quantidadeDisponivel,
              deficit: Math.max(0, quantidadeNecessaria - quantidadeDisponivel),
            }
          }),
        )

        const precoProduto = produto ? Number(produto.preco) : 0
        const receitaEsperada = precoProduto * meta.quantidadePlanejada
        const viavelComEstoqueCampanha = materiaisNecessarios.every((m) => m.deficit === 0)

        return {
          meta,
          nomeProduto: produto?.nome ?? meta.produtoId,
          precoProduto,
          receitaEsperada,
          materiaisNecessarios,
          viavelComEstoqueCampanha,
        }
      }),
    )
  }
}
