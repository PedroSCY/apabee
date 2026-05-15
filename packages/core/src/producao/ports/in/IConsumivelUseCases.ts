import { UnidadeMedida } from '@apa/shared'
import { EstoqueMateriaPrima } from '../../entities/EstoqueMateriaPrima'
import { TipoMateriaPrima } from '../../entities/TipoMateriaPrima'

export interface RegistrarEntradaConsumivelInput {
  tipoMateriaPrimaId: string
  quantidade: number
  referenciaId?: string
}

export interface IRegistrarEntradaConsumivelUseCase {
  execute(input: RegistrarEntradaConsumivelInput): Promise<EstoqueMateriaPrima>
}

export interface IListarConsumiveisUseCase {
  /** Lista todos os tipos de matéria-prima com unidade UNIDADE (consumíveis) e seus saldos. */
  execute(): Promise<{ tipo: TipoMateriaPrima; estoque: EstoqueMateriaPrima | null }[]>
}

export interface MigrarInsumosInput {
  /** IDs dos TipoMateriaPrima com unidade UNIDADE a serem registrados como consumíveis no estoque. */
  tipoMateriaPrimaIds: string[]
}

export interface IMigrarInsumosConsumiveisUseCase {
  /** Idempotente: cria entradas de estoque com saldo zero para tipos que ainda não têm. */
  execute(input: MigrarInsumosInput): Promise<{ criados: number; existentes: number }>
}
