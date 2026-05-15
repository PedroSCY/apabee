import { Cota } from '../../entities/Cota'

/** Repositório de cotas de campanhas de aquisição. */
export interface ICotaRepository {
  findById(id: string): Promise<Cota | null>
  findByCampanha(campanhaId: string): Promise<Cota[]>
  findByAssociado(associadoId: string): Promise<Cota[]>
  /** Soma o valor das cotas confirmadas (pago=true) da campanha. */
  sumByCampanha(campanhaId: string): Promise<number>
  save(cota: Cota): Promise<Cota>
  update(cota: Cota): Promise<Cota>
  delete(id: string): Promise<void>
}
