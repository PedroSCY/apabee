import { MetaProducao } from '../../entities/MetaProducao'

export interface CriarMetaProducaoInput {
  campanhaId: string
  produtoId: string
  quantidadePlanejada: number
  perdaPercentualEstimada?: number
}

export interface MaterialNecessario {
  tipoMateriaPrimaId: string
  nomeTipo: string
  unidade: string
  quantidadeNecessaria: number
  quantidadeDisponivel: number
  deficit: number
}

export interface MetaProducaoDetalhe {
  meta: MetaProducao
  nomeProduto: string
  precoProduto: number
  receitaEsperada: number
  materiaisNecessarios: MaterialNecessario[]
  viavelComEstoqueCampanha: boolean
}

export interface ICriarMetaProducaoUseCase {
  execute(input: CriarMetaProducaoInput): Promise<MetaProducao>
}

export interface IListarMetasProducaoUseCase {
  execute(campanhaId: string): Promise<MetaProducaoDetalhe[]>
}

export interface IRemoverMetaProducaoUseCase {
  execute(metaId: string): Promise<void>
}
