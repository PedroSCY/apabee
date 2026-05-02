import { RoleUsuario } from '@apa/shared'

export interface CriarCredencialInput {
  email: string
  role: RoleUsuario
  nome?: string
  telefone?: string
}

export interface IProvedorAuth {
  criarCredencial(input: CriarCredencialInput): Promise<{ id: string }>
  ativarAcesso(id: string): Promise<void>
  revogarAcesso(id: string): Promise<void>
}
