import { StatusSafra } from '@apa/shared'
import { Safra } from '../../entities/Safra'

/** Repositório de safras apícolas. */
export interface ISafraRepository {
  findById(id: string): Promise<Safra | null>
  findAll(): Promise<Safra[]>
  findByStatus(status: StatusSafra): Promise<Safra[]>
  save(safra: Safra): Promise<Safra>
  update(safra: Safra): Promise<Safra>
}
