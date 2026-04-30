import { Documento } from '../../entities/Documento';
import { CategoriaDocumento } from '@apa/shared';

export interface IDocumentoRepository {
  findById(id: string): Promise<Documento | null>;
  findAll(): Promise<Documento[]>;
  findPublicados(): Promise<Documento[]>;
  findByCategoria(categoria: CategoriaDocumento): Promise<Documento[]>;
  save(documento: Documento): Promise<Documento>;
  update(documento: Documento): Promise<Documento>;
  delete(id: string): Promise<void>;
}
