import { TipoMateriaPrima } from '../../entities/TipoMateriaPrima'

export interface ITipoMateriaPrimaRepository {
  findById(id: string): Promise<TipoMateriaPrima | null>
  findAll(): Promise<TipoMateriaPrima[]>
  save(tipo: TipoMateriaPrima): Promise<TipoMateriaPrima>
}
