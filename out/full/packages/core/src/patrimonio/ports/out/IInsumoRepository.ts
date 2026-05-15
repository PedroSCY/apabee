import { Insumo } from '../../entities/Insumo'

/** Contrato de repositório para o agregado Insumo (unidade individual). */
export interface IInsumoRepository {
  /** Busca insumo pelo ID. */
  findById(id: string): Promise<Insumo | null>
  /** Lista todas as unidades de insumo, opcionalmente filtradas por tipo. */
  findAll(tipoInsumoId?: string): Promise<Insumo[]>
  /** Lista unidades disponíveis de um tipo, limitadas por quantidade. */
  findAvailableByTipo(tipoInsumoId: string, limit: number): Promise<Insumo[]>
  /** Retorna o maior número de sequência já usado em identificadores de um tipo (ex: FUM-003 → 3). Retorna 0 se não há unidades. */
  maxSequenceByTipo(tipoInsumoId: string): Promise<number>
  /** Persiste uma nova unidade de insumo. */
  save(insumo: Insumo): Promise<Insumo>
  /** Persiste múltiplas unidades de uma vez. */
  saveMany(insumos: Insumo[]): Promise<Insumo[]>
  /** Atualiza os dados de uma unidade existente. */
  update(insumo: Insumo): Promise<Insumo>
  /** Remove uma unidade de insumo pelo ID. */
  delete(id: string): Promise<void>
}
