import { ItemAquisicao } from '../../entities/ItemAquisicao'

/** Repositório de itens planejados para campanhas de aquisição coletiva. */
export interface IItemAquisicaoRepository {
  findById(id: string): Promise<ItemAquisicao | null>
  findByCampanha(campanhaId: string): Promise<ItemAquisicao[]>
  save(item: ItemAquisicao): Promise<ItemAquisicao>
  update(item: ItemAquisicao): Promise<ItemAquisicao>
  delete(id: string): Promise<void>
}
