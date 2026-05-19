import { TipoMateriaPrima } from '../../entities/TipoMateriaPrima'

/** Repositório para tipos de matéria-prima. */
export interface ITipoMateriaPrimaRepository {
  findById(id: string): Promise<TipoMateriaPrima | null>
  findAll(): Promise<TipoMateriaPrima[]>
  save(tipo: TipoMateriaPrima): Promise<TipoMateriaPrima>
  delete(id: string): Promise<void>
}
