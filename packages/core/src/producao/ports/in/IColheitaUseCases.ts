import { UnidadeMedida } from '@apa/shared'
import { Colheita } from '../../entities/Colheita'

/** Dados para registro de uma nova colheita. */
export interface CriarColheitaInput {
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  loteProducaoId: string
  volume: number
  unidade: UnidadeMedida
  dataColheita: Date
  observacao?: string
}

/** Registra uma nova colheita de matéria-prima. */
export interface ICriarColheitaUseCase {
  execute(input: CriarColheitaInput): Promise<Colheita>
}

/** Lista colheitas de um associado específico. */
export interface IListarColheitasPorAssociadoUseCase {
  execute(associadoId: string): Promise<Colheita[]>
}

/** Lista colheitas vinculadas a um lote de produção. */
export interface IListarColheitasPorLoteUseCase {
  execute(loteId: string): Promise<Colheita[]>
}
