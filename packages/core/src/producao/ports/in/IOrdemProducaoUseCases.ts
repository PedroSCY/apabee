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

export interface ConfirmarOrdemProducaoInput {
  ordemId: string
  quantidadeReal: number
  sobrasRecuperadas?: number
  observacao?: string
}

export interface IConfirmarOrdemProducaoUseCase {
  execute(input: ConfirmarOrdemProducaoInput): Promise<OrdemProducao>
}

export interface IListarOrdensPorCampanhaUseCase {
  execute(campanhaId: string): Promise<OrdemProducao[]>
}

export interface ConsumoMaterialPreview {
  nome: string
  quantidade: number
  unidade: string
  suficiente: boolean
}

export interface ICalcularConsumoUseCase {
  /** Calcula quanto será consumido do pool (com perda) sem executar a ordem. Retorna um preview. */
  execute(ordemId: string): Promise<ConsumoMaterialPreview[]>
}

export interface IDeletarOrdemProducaoUseCase {
  execute(id: string): Promise<void>
}

export interface IEstornarOrdemProducaoUseCase {
  execute(campanhaId: string, ordemId: string): Promise<OrdemProducao>
}
