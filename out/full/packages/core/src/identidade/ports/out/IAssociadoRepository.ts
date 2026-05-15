import { Associado } from '../../entities/Associado'

/** Repositório para persistência de associados. Inclui o usuário vinculado. */
export interface IAssociadoRepository {
  /** Busca associado pelo ID. */
  findById(id: string): Promise<Associado | null>
  /** Busca associado pelo ID do usuário vinculado (JWT sub). */
  findByUsuarioId(usuarioId: string): Promise<Associado | null>
  /** Lista todos os associados. */
  findAll(): Promise<Associado[]>
  /** Cria um novo associado. */
  save(associado: Associado): Promise<Associado>
  /** Atualiza dados do associado. */
  update(associado: Associado): Promise<Associado>
  /** Remove associado e o usuário vinculado (cascade). */
  delete(id: string): Promise<void>
}
