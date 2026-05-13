import { AtribuicaoPatrimonio } from '../../entities/AtribuicaoPatrimonio';
import { TipoPatrimonio } from '@apa/shared';

export interface IAtribuicaoPatrimonioRepository {
  findById(id: string): Promise<AtribuicaoPatrimonio | null>;
  findAll(): Promise<AtribuicaoPatrimonio[]>;
  findByAssociado(associadoId: string): Promise<AtribuicaoPatrimonio[]>;
  findByAssociadoETipo(associadoId: string, tipo: TipoPatrimonio): Promise<AtribuicaoPatrimonio[]>;
  findAtivaByPatrimonio(patrimonioId: string, tipo: TipoPatrimonio): Promise<AtribuicaoPatrimonio | null>;
  save(atribuicao: AtribuicaoPatrimonio): Promise<AtribuicaoPatrimonio>;
  update(atribuicao: AtribuicaoPatrimonio): Promise<AtribuicaoPatrimonio>;
}
