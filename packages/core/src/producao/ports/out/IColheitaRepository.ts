import { Colheita } from '../../entities/Colheita';

/** Repositório para colheitas. */
export interface IColheitaRepository {
  findAll(): Promise<Colheita[]>;
  findById(id: string): Promise<Colheita | null>;
  findByAssociado(associadoId: string): Promise<Colheita[]>;
  findByCampanha(campanhaId: string): Promise<Colheita[]>;
  save(colheita: Colheita): Promise<Colheita>;
  delete(id: string): Promise<void>;
}
