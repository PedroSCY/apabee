import { CustoCampanha } from '../../entities/CustoCampanha'

/** Repositório de custos categorizados de campanhas. */
export interface ICustoCampanhaRepository {
  findById(id: string): Promise<CustoCampanha | null>
  findByCampanha(campanhaId: string): Promise<CustoCampanha[]>
  /** Soma todos os custos de uma campanha. */
  sumByCampanha(campanhaId: string): Promise<number>
  save(custo: CustoCampanha): Promise<CustoCampanha>
  delete(id: string): Promise<void>
}
