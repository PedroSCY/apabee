import { TipoInsumo } from '../../entities/TipoInsumo'

/** Contrato de repositório para o agregado TipoInsumo. */
export interface ITipoInsumoRepository {
  /** Busca tipo de insumo pelo ID. */
  findById(id: string): Promise<TipoInsumo | null>
  /** Busca tipo de insumo pela sigla (case-insensitive). */
  findBySigla(sigla: string): Promise<TipoInsumo | null>
  /** Lista todos os tipos de insumo. */
  findAll(): Promise<TipoInsumo[]>
  /** Persiste um novo tipo de insumo. */
  save(tipoInsumo: TipoInsumo): Promise<TipoInsumo>
  /** Atualiza os dados de um tipo de insumo existente. */
  update(tipoInsumo: TipoInsumo): Promise<TipoInsumo>
  /** Remove um tipo de insumo pelo ID. */
  delete(id: string): Promise<void>
}
