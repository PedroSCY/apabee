import { RoleUsuario, StatusAssociado } from '@apa/shared'

// ─── Usuário ─────────────────────────────────────────────────────────────────

export interface UsuarioResponse {
  id: string
  nome: string
  email: string
  role: RoleUsuario
  ativo: boolean
  criadoEm: Date
}

// ─── Associado ────────────────────────────────────────────────────────────────

export interface AssociadoResponse {
  id: string
  cpf?: string
  usuario: UsuarioResponse
  dataIngresso: Date
  observacoes?: string
  status: StatusAssociado
  isentoMensalidade: boolean
}
