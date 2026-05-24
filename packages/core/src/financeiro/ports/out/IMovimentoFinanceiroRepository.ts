import { MovimentoFinanceiro } from '../../entities/MovimentoFinanceiro'

export interface FindMovimentosParams {
  associadoId?: string
  campanhaId?: string
  limit?: number
}

/** Repositório de movimentos financeiros. */
export interface IMovimentoFinanceiroRepository {
  findAll(params?: FindMovimentosParams): Promise<MovimentoFinanceiro[]>
  findByCampanha(campanhaId: string): Promise<MovimentoFinanceiro[]>
  findByAssociadoECampanha(associadoId: string, campanhaId: string): Promise<MovimentoFinanceiro[]>
  findByAssociado(associadoId: string): Promise<MovimentoFinanceiro[]>
  save(movimento: MovimentoFinanceiro): Promise<MovimentoFinanceiro>
  saveMany(movimentos: MovimentoFinanceiro[]): Promise<MovimentoFinanceiro[]>
}
