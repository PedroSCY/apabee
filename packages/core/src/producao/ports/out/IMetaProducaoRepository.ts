import { MetaProducao } from '../../entities/MetaProducao'

export interface IMetaProducaoRepository {
  findById(id: string): Promise<MetaProducao | null>
  findByCampanha(campanhaId: string): Promise<MetaProducao[]>
  findByCampanhaEProduto(campanhaId: string, produtoId: string): Promise<MetaProducao | null>
  save(meta: MetaProducao): Promise<MetaProducao>
  delete(id: string): Promise<void>
}
