import { RelatorioProducao } from '../../entities/RelatorioProducao'

/** Repositório de relatórios de produção. */
export interface IRelatorioProducaoRepository {
  findById(id: string): Promise<RelatorioProducao | null>
  findAll(): Promise<RelatorioProducao[]>
  findByPeriodo(dataInicio: Date, dataFim: Date): Promise<RelatorioProducao[]>
  save(relatorio: RelatorioProducao): Promise<RelatorioProducao>
}
