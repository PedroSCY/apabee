import { MovimentoFinanceiro } from '../../entities/MovimentoFinanceiro';
import { ApuracaoLote } from '../../entities/ApuracaoLote';

/** Repositório de movimentos financeiros. */
export interface IMovimentoFinanceiroRepository {
  findByLote(loteId: string): Promise<MovimentoFinanceiro[]>;
  findByAssociadoELote(associadoId: string, loteId: string): Promise<MovimentoFinanceiro[]>;
  save(movimento: MovimentoFinanceiro): Promise<MovimentoFinanceiro>;
}

/** Repositório de apurações de lote. */
export interface IApuracaoLoteRepository {
  findByLote(loteId: string): Promise<ApuracaoLote | null>;
  save(apuracao: ApuracaoLote): Promise<ApuracaoLote>;
}
