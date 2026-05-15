import { OrdemProducao } from '../../entities/OrdemProducao'

export interface CriarOrdemProducaoInput {
  campanhaId: string
  produtoId: string
  quantidade: number
  perdaPercentual?: number
}

export interface ICriarOrdemProducaoUseCase {
  execute(input: CriarOrdemProducaoInput): Promise<OrdemProducao>
}

export interface IExecutarOrdemProducaoUseCase {
  execute(id: string): Promise<OrdemProducao>
}

export interface IListarOrdensPorCampanhaUseCase {
  execute(campanhaId: string): Promise<OrdemProducao[]>
}

export interface ICalcularConsumoUseCase {
  /** Calcula quanto será consumido do pool (com perda) sem executar a ordem. Retorna um preview. */
  execute(ordemId: string): Promise<{ tipoMateriaPrimaId: string; quantidadeNecessaria: number; quantidadeComPerda: number; suficiente: boolean }[]>
}

export interface IConcluirOrdemProducaoUseCase {
  execute(id: string): Promise<OrdemProducao>
}
