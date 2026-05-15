import { MovimentoFinanceiro } from '../../entities/MovimentoFinanceiro'

/** Repositório de movimentos financeiros. */
export interface IMovimentoFinanceiroRepository {
  findByCampanha(campanhaId: string): Promise<MovimentoFinanceiro[]>
  findByAssociadoECampanha(associadoId: string, campanhaId: string): Promise<MovimentoFinanceiro[]>
  save(movimento: MovimentoFinanceiro): Promise<MovimentoFinanceiro>
  saveMany(movimentos: MovimentoFinanceiro[]): Promise<MovimentoFinanceiro[]>
}
