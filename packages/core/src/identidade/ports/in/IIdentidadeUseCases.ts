import { RoleUsuario } from '@apa/shared'
import { Associado, Usuario } from '../../entities'

// ---- Criar Usuário ----
export interface CriarUsuarioInput {
  nome: string
  email: string
  role: RoleUsuario
  telefone?: string
  senha?: string
}
export interface ICriarUsuarioUseCase {
  execute(input: CriarUsuarioInput): Promise<Usuario>
}

// ---- Criar Associado ----
export interface CriarAssociadoInput {
  usuarioId: string
  dataIngresso?: Date
  observacoes?: string
}
export interface ICriarAssociadoUseCase {
  execute(input: CriarAssociadoInput): Promise<Associado>
}

// ---- Ativar / Desativar Usuário ----
export interface AlterarStatusUsuarioInput {
  usuarioId: string
}
export interface IDesativarUsuarioUseCase {
  execute(input: AlterarStatusUsuarioInput): Promise<void>
}
export interface IAtivarUsuarioUseCase {
  execute(input: AlterarStatusUsuarioInput): Promise<void>
}

// ---- Listar Associados ----
export interface IListarAssociadosUseCase {
  execute(): Promise<Associado[]>
}

// ---- Buscar Associado por ID ----
export interface IBuscarAssociadoUseCase {
  execute(id: string): Promise<Associado>
}

// ---- Buscar Associado pelo userId (JWT sub) ----
export interface IBuscarAssociadoPorUsuarioUseCase {
  execute(usuarioId: string): Promise<Associado | null>
}

// ---- Excluir Associado ----
export interface IExcluirAssociadoUseCase {
  execute(id: string): Promise<void>
}

// ---- Atualizar Associado ----
export interface AtualizarAssociadoInput {
  associadoId: string
  status?: string
  dataIngresso?: Date
  observacoes?: string
}
export interface IAtualizarAssociadoUseCase {
  execute(input: AtualizarAssociadoInput): Promise<Associado>
}

// ---- Atualizar Usuário ----
export interface AtualizarUsuarioInput {
  usuarioId: string
  nome?: string
  email?: string
  role?: RoleUsuario
}
export interface IAtualizarUsuarioUseCase {
  execute(input: AtualizarUsuarioInput): Promise<Usuario>
}

// ---- Criar Associado Pendente (via solicitação de contato) ----
export interface CriarAssociadoPendenteInput {
  nome: string
  email: string
  telefone?: string
  observacoes?: string
}
export interface ICriarAssociadoPendenteUseCase {
  execute(input: CriarAssociadoPendenteInput): Promise<Associado>
}

// ---- Aprovar Associado Pendente ----
export interface AprovarAssociadoPendenteInput {
  associadoId: string
  senha: string
  dataIngresso?: Date
}
export interface IAprovarAssociadoPendenteUseCase {
  execute(input: AprovarAssociadoPendenteInput): Promise<Associado>
}
