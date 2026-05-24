import { RoleUsuario } from '@apa/shared'
import { Associado, Usuario } from '../../entities'

/** Dados necessários para criar um novo usuário. */
export interface CriarUsuarioInput {
  nome: string
  email: string
  role: RoleUsuario
  telefone?: string
  senha?: string
}
/** Cria um usuário no banco local e no provedor de autenticação (Supabase). */
export interface ICriarUsuarioUseCase {
  execute(input: CriarUsuarioInput): Promise<Usuario>
}

/** Dados para vincular um usuário existente como associado. */
export interface CriarAssociadoInput {
  usuarioId: string
  cpf?: string
  dataIngresso?: Date
  observacoes?: string
}
/** Cria um associado vinculado a um usuário já existente. */
export interface ICriarAssociadoUseCase {
  execute(input: CriarAssociadoInput): Promise<Associado>
}

/** Apenas o ID do usuário para ativar/desativar. */
export interface AlterarStatusUsuarioInput {
  usuarioId: string
}
/** Desativa um usuário: revoga acesso no Supabase e marca como inativo no banco. */
export interface IDesativarUsuarioUseCase {
  execute(input: AlterarStatusUsuarioInput): Promise<void>
}
/** Reativa um usuário: remove ban no Supabase e marca como ativo. */
export interface IAtivarUsuarioUseCase {
  execute(input: AlterarStatusUsuarioInput): Promise<void>
}

/** Lista todos os associados com dados do usuário vinculado. */
export interface IListarAssociadosUseCase {
  execute(): Promise<Associado[]>
}

/** Busca um associado pelo ID. */
export interface IBuscarAssociadoUseCase {
  execute(id: string): Promise<Associado>
}

/** Busca o associado vinculado ao usuário logado (via JWT sub). Útil para o endpoint /me. */
export interface IBuscarAssociadoPorUsuarioUseCase {
  execute(usuarioId: string): Promise<Associado | null>
}

/** Exclui um associado e o usuário vinculado. Bloqueado se houver registros de autoria. */
export interface IExcluirAssociadoUseCase {
  execute(id: string): Promise<void>
}

/** Dados para atualizar um associado. Status aciona side effects no Supabase (suspender/reativar). */
export interface AtualizarAssociadoInput {
  associadoId: string
  cpf?: string
  status?: string
  dataIngresso?: Date
  observacoes?: string
}
/** Atualiza dados do associado. Se o status mudar, sincroniza com Supabase Auth. */
export interface IAtualizarAssociadoUseCase {
  execute(input: AtualizarAssociadoInput): Promise<Associado>
}

/** Dados para atualizar um usuário. */
export interface AtualizarUsuarioInput {
  usuarioId: string
  nome?: string
  email?: string
  role?: RoleUsuario
}
/** Atualiza dados cadastrais do usuário. */
export interface IAtualizarUsuarioUseCase {
  execute(input: AtualizarUsuarioInput): Promise<Usuario>
}

/** Dados para criar um associado pendente (stub). Usado quando alguém solicita associação via formulário público. */
export interface CriarAssociadoPendenteInput {
  nome: string
  email: string
  cpf?: string
  telefone?: string
  observacoes?: string
}
/** Cria um associado com status PENDENTE e conta no Supabase sem senha (bloqueada). */
export interface ICriarAssociadoPendenteUseCase {
  execute(input: CriarAssociadoPendenteInput): Promise<Associado>
}

/** Dados para aprovar um associado pendente. Define senha e libera acesso. */
export interface AprovarAssociadoPendenteInput {
  associadoId: string
  cpf?: string
  senha: string
  dataIngresso?: Date
}
/** Aprova um associado pendente: define senha, libera acesso no Supabase e ativa a conta. */
export interface IAprovarAssociadoPendenteUseCase {
  execute(input: AprovarAssociadoPendenteInput): Promise<Associado>
}

/** Marca o associado como isento estrutural — não receberá mensalidades em batches futuros. Reversível. */
export interface IMarcarIsentoAssociadoUseCase {
  execute(associadoId: string): Promise<Associado>
}

/** Remove a isenção estrutural do associado — volta a receber mensalidades em batches futuros. */
export interface IRemoverIsencaoAssociadoUseCase {
  execute(associadoId: string): Promise<Associado>
}
