import { RelatorioProducao } from '../../entities/RelatorioProducao'

export interface IRelatorioProducaoRepository {
  findById(id: string): Promise<RelatorioProducao | null>
  findAll(): Promise<RelatorioProducao[]>
  findByPeriodo(dataInicio: Date, dataFim: Date): Promise<RelatorioProducao[]>
  save(relatorio: RelatorioProducao): Promise<RelatorioProducao>
}
