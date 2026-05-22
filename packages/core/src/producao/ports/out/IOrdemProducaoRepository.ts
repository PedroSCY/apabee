import { OrdemProducao } from '../../entities/OrdemProducao'

/** Repositório de ordens de produção. */
export interface IOrdemProducaoRepository {
  findById(id: string): Promise<OrdemProducao | null>
  findByCampanha(campanhaId: string, statuses?: string[]): Promise<OrdemProducao[]>
  save(ordem: OrdemProducao): Promise<OrdemProducao>
  update(ordem: OrdemProducao): Promise<OrdemProducao>
  delete(id: string): Promise<void>
}
