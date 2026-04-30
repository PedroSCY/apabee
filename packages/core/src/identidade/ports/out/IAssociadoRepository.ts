import { Associado } from '../../entities/Associado';

export interface IAssociadoRepository {
  findById(id: string): Promise<Associado | null>;
  findAll(): Promise<Associado[]>;
  save(associado: Associado): Promise<Associado>;
  update(associado: Associado): Promise<Associado>;
  delete(id: string): Promise<void>;
}
