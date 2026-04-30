import { MovimentoFinanceiro } from '../../entities/MovimentoFinanceiro';
import { ApuracaoLote } from '../../entities/ApuracaoLote';

export interface IMovimentoFinanceiroRepository {
  findByLote(loteId: string): Promise<MovimentoFinanceiro[]>;
  findByAssociadoELote(associadoId: string, loteId: string): Promise<MovimentoFinanceiro[]>;
  save(movimento: MovimentoFinanceiro): Promise<MovimentoFinanceiro>;
}

export interface IApuracaoLoteRepository {
  findByLote(loteId: string): Promise<ApuracaoLote | null>;
  save(apuracao: ApuracaoLote): Promise<ApuracaoLote>;
}
