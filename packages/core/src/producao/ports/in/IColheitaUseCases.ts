import { UnidadeMedida } from '@apa/shared'
import { Colheita } from '../../entities/Colheita'

/** Dados para registro de uma nova colheita. campanhaId é opcional — colheita sem vínculo vai ao pool diretamente (RN14). */
export interface CriarColheitaInput {
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  /** Campanha à qual esta colheita está vinculada (RN14). */
  campanhaId?: string
  /** Safra para calcular tier de qualidade no rateio (RN28). */
  safraId?: string
  volume: number
  unidade: UnidadeMedida
  dataColheita: Date
  observacao?: string
}

/** Registra uma nova colheita de matéria-prima. */
export interface ICriarColheitaUseCase {
  execute(input: CriarColheitaInput): Promise<Colheita>
}

/** Lista todas as colheitas (visão admin). */
export interface IListarColheitasUseCase {
  execute(): Promise<Colheita[]>
}

/** Lista colheitas de um associado específico. */
export interface IListarColheitasPorAssociadoUseCase {
  execute(associadoId: string): Promise<Colheita[]>
}

/** Lista colheitas vinculadas a uma campanha. */
export interface IListarColheitasPorCampanhaUseCase {
  execute(campanhaId: string): Promise<Colheita[]>
}

/** Exclui uma colheita se o estoque ainda não foi consumido. */
export interface IDeletarColheitaUseCase {
  execute(id: string): Promise<void>
}
