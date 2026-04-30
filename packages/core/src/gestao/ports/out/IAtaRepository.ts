import { Ata } from '../../entities/Ata';
import { ParticipanteAta } from '../../entities/ParticipanteAta';

export interface IAtaRepository {
  findById(id: string): Promise<Ata | null>;
  findAll(): Promise<Ata[]>;
  findPublicadas(): Promise<Ata[]>;
  save(ata: Ata): Promise<Ata>;
  update(ata: Ata): Promise<Ata>;
}

export interface IParticipanteAtaRepository {
  findByAta(ataId: string): Promise<ParticipanteAta[]>;
  save(participante: ParticipanteAta): Promise<ParticipanteAta>;
  delete(id: string): Promise<void>;
}
