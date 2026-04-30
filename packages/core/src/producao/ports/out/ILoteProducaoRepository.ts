import { LoteProducao } from '../../entities/LoteProducao';
import { ParticipacaoLote } from '../../entities/ParticipacaoLote';

export interface ILoteProducaoRepository {
  findById(id: string): Promise<LoteProducao | null>;
  findAtivos(): Promise<LoteProducao[]>;
  findAll(): Promise<LoteProducao[]>;
  save(lote: LoteProducao): Promise<LoteProducao>;
  update(lote: LoteProducao): Promise<LoteProducao>;
}

export interface IParticipacaoLoteRepository {
  findByLote(loteId: string): Promise<ParticipacaoLote[]>;
  findByAssociadoELote(associadoId: string, loteId: string): Promise<ParticipacaoLote | null>;
  save(participacao: ParticipacaoLote): Promise<ParticipacaoLote>;
  update(participacao: ParticipacaoLote): Promise<ParticipacaoLote>;
}
