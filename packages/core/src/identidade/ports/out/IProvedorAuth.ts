import { RoleUsuario } from '@apa/shared'

export interface CriarCredencialInput {
  email: string
  role: RoleUsuario
  nome?: string
  telefone?: string
  senha?: string
  /** Quando false, nenhum e-mail é enviado ao criar a conta. Use para associados pendentes. */
  enviarEmail?: boolean
}

export interface IProvedorAuth {
  criarCredencial(input: CriarCredencialInput): Promise<{ id: string }>
  ativarAcesso(id: string): Promise<void>
  revogarAcesso(id: string): Promise<void>
  definirSenha(usuarioId: string, senha: string): Promise<void>
  removerCredencial(usuarioId: string): Promise<void>
  atualizarMetadata(usuarioId: string, metadata: Record<string, unknown>): Promise<void>
}
