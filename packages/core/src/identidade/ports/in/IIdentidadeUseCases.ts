import { RoleUsuario } from "@repo/shared"
import { Associado, Usuario } from "../../entities"

// ---- Criar Usuário ----
export interface CriarUsuarioInput {
  nome: string
  email: string
  role: RoleUsuario
  telefone?: string
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
