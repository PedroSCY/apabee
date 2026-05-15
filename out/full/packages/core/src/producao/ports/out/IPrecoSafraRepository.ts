import { PrecoSafra } from '../../entities/PrecoSafra'

/** Repositório de preços de matéria-prima por safra. */
export interface IPrecoSafraRepository {
  findByTipoESafra(tipoMateriaPrimaId: string, safraId: string): Promise<PrecoSafra | null>
  findBySafra(safraId: string): Promise<PrecoSafra[]>
  save(preco: PrecoSafra): Promise<PrecoSafra>
  update(preco: PrecoSafra): Promise<PrecoSafra>
}
