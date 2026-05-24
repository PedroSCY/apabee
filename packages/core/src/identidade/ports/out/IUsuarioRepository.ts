import { Usuario } from '../../entities'

/** Repositório para persistência de usuários. O ID do usuário é o mesmo UUID do Supabase Auth. */
export interface IUsuarioRepository {
  /** Busca usuário pelo ID (mesmo UUID do Supabase). */
  findById(id: string): Promise<Usuario | null>
  /** Busca usuário pelo email (único). */
  findByEmail(email: string): Promise<Usuario | null>
  /** Cria um novo registro de usuário. */
  save(usuario: Usuario): Promise<Usuario>
  /** Atualiza dados do usuário existente. */
  update(usuario: Usuario): Promise<Usuario>
  /** Remove usuário pelo ID. */
  delete(id: string): Promise<void>
  /** Soft delete: marca deletadoEm e anonimiza o email, liberando o unique constraint para recadastro. */
  anonymizar(id: string): Promise<void>
  /** Verifica se o usuário possui atas ou documentos de autoria (impede exclusão). */
  contemRegistrosDeAutoria(id: string): Promise<boolean>
}
