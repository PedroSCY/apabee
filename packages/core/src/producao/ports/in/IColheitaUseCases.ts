import { UnidadeMedida } from '@apa/shared'
import { Colheita } from '../../entities/Colheita'

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

export interface ICriarColheitaUseCase {
  execute(input: CriarColheitaInput): Promise<Colheita>
}

export interface IListarColheitasPorAssociadoUseCase {
  execute(associadoId: string): Promise<Colheita[]>
}

export interface IListarColheitasPorLoteUseCase {
  execute(loteId: string): Promise<Colheita[]>
}
