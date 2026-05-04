import { apiFetch } from './client'

export interface UsuarioResponse {
  id: string
  nome: string
  email: string
  role: string
  ativo: boolean
  criadoEm: string
}

export interface AssociadoResponse {
  id: string
  usuario: UsuarioResponse
  dataIngresso: string
  observacoes?: string
  status: string
}

export interface CriarAssociadoInput {
  usuarioId: string
  dataIngresso?: string
  observacoes?: string
}

export interface CriarUsuarioInput {
  nome: string
  email: string
  role?: string
  telefone?: string
}

export const identidadeApi = {
  listarAssociados: () => apiFetch<AssociadoResponse[]>('/identidade/associados'),

  criarUsuario: (input: CriarUsuarioInput) =>
    apiFetch<UsuarioResponse>('/identidade/usuarios', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  criarAssociado: (input: CriarAssociadoInput) =>
    apiFetch<AssociadoResponse>('/identidade/associados', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  ativarUsuario: (id: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/ativar`, { method: 'PATCH' }),

  desativarUsuario: (id: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/desativar`, { method: 'PATCH' }),
}
