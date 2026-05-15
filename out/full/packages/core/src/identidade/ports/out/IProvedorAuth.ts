import { RoleUsuario } from '@apa/shared'

/** Dados para criar uma credencial no provedor de autenticação externo. */
export interface CriarCredencialInput {
  email: string
  role: RoleUsuario
  nome?: string
  telefone?: string
  senha?: string
  /** Quando false, nenhum e-mail é enviado ao criar a conta. Use para associados pendentes. */
  enviarEmail?: boolean
}

/** Interface para o provedor de autenticação externo (Supabase Auth). Permite trocar de provedor sem alterar o domínio. */
export interface IProvedorAuth {
  /** Cria uma nova credencial (conta) no provedor externo. Retorna o ID do usuário no provedor. */
  criarCredencial(input: CriarCredencialInput): Promise<{ id: string }>
  /** Remove ban/restrição de acesso de um usuário. */
  ativarAcesso(id: string): Promise<void>
  /** Aplica ban/restrição de acesso a um usuário. */
  revogarAcesso(id: string): Promise<void>
  /** Define/altera a senha de um usuário. */
  definirSenha(usuarioId: string, senha: string): Promise<void>
  /** Remove permanentemente a credencial do usuário. */
  removerCredencial(usuarioId: string): Promise<void>
  /** Atualiza metadados (app_metadata) do usuário no provedor. */
  atualizarMetadata(usuarioId: string, metadata: Record<string, unknown>): Promise<void>
}
