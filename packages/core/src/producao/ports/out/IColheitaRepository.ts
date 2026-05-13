import { Colheita } from '../../entities/Colheita';

/** Repositório para colheitas. */
export interface IColheitaRepository {
  findById(id: string): Promise<Colheita | null>;
  findByAssociado(associadoId: string): Promise<Colheita[]>;
  findByLote(loteId: string): Promise<Colheita[]>;
  save(colheita: Colheita): Promise<Colheita>;
}
