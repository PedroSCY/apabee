import { AtribuicaoPatrimonio } from '../../entities/AtribuicaoPatrimonio';
import { TipoPatrimonio } from '@apa/shared';

/** Contrato de repositório para o agregado AtribuicaoPatrimonio. */
export interface IAtribuicaoPatrimonioRepository {
  /** Busca atribuição pelo ID. */
  findById(id: string): Promise<AtribuicaoPatrimonio | null>;
  /** Lista todas as atribuições. */
  findAll(): Promise<AtribuicaoPatrimonio[]>;
  /** Lista atribuições de um associado. */
  findByAssociado(associadoId: string): Promise<AtribuicaoPatrimonio[]>;
  /** Lista atribuições de um associado filtradas por tipo de patrimônio. */
  findByAssociadoETipo(associadoId: string, tipo: TipoPatrimonio): Promise<AtribuicaoPatrimonio[]>;
  /** Busca a atribuição ativa de um patrimônio específico. */
  findAtivaByPatrimonio(patrimonioId: string, tipo: TipoPatrimonio): Promise<AtribuicaoPatrimonio | null>;
  /** Persiste uma nova atribuição. */
  save(atribuicao: AtribuicaoPatrimonio): Promise<AtribuicaoPatrimonio>;
  /** Atualiza os dados de uma atribuição existente. */
  update(atribuicao: AtribuicaoPatrimonio): Promise<AtribuicaoPatrimonio>;
}
