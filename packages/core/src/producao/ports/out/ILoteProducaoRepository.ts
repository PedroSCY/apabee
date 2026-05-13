import { LoteProducao } from '../../entities/LoteProducao';
import { ParticipacaoLote } from '../../entities/ParticipacaoLote';

/** Repositório para lotes de produção. */
export interface ILoteProducaoRepository {
  findById(id: string): Promise<LoteProducao | null>;
  findAtivos(): Promise<LoteProducao[]>;
  findAll(): Promise<LoteProducao[]>;
  findAbertosVencidos(): Promise<LoteProducao[]>;
  save(lote: LoteProducao): Promise<LoteProducao>;
  update(lote: LoteProducao): Promise<LoteProducao>;
}

/** Repositório para participações em lotes. */
export interface IParticipacaoLoteRepository {
  findByLote(loteId: string): Promise<ParticipacaoLote[]>;
  findByAssociadoELote(associadoId: string, loteId: string): Promise<ParticipacaoLote | null>;
  save(participacao: ParticipacaoLote): Promise<ParticipacaoLote>;
  update(participacao: ParticipacaoLote): Promise<ParticipacaoLote>;
  updateMany(participacoes: ParticipacaoLote[]): Promise<void>;
}
