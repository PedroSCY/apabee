import { Contribuicao } from '../../entities/Contribuicao'

/** Repositório de contribuições de associados a campanhas. */
export interface IContribuicaoRepository {
  findById(id: string): Promise<Contribuicao | null>
  findByCampanha(campanhaId: string): Promise<Contribuicao[]>
  findByAssociado(associadoId: string): Promise<Contribuicao[]>
  findByCampanhaEAssociado(campanhaId: string, associadoId: string): Promise<Contribuicao[]>
  /** Soma o valorMonetario de todas as contribuições de cada participante (null = associação) na campanha. */
  sumByCampanha(campanhaId: string): Promise<{ associadoId: string | null; total: number }[]>
  save(contribuicao: Contribuicao): Promise<Contribuicao>
  update(contribuicao: Contribuicao): Promise<Contribuicao>
  delete(id: string): Promise<void>
}
