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

export interface CriarAssociadoPendenteInput {
  nome: string
  email: string
  telefone?: string
  observacoes?: string
}

export interface AprovarAssociadoPendenteInput {
  senha: string
  dataIngresso?: string
}

export interface CriarUsuarioInput {
  nome: string
  email: string
  role?: string
  telefone?: string
  senha?: string
}

export interface AtualizarUsuarioInput {
  nome?: string
  email?: string
  role?: string
}

export interface AtualizarAssociadoInput {
  dataIngresso?: string
  observacoes?: string
  status?: string
}

export const identidadeApi = {
  meuPerfil: () => apiFetch<AssociadoResponse>('/identidade/me'),

  listarAssociados: () => apiFetch<AssociadoResponse[]>('/identidade/associados'),

  buscarAssociado: (id: string) => apiFetch<AssociadoResponse>(`/identidade/associados/${id}`),

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

  criarAssociadoPendente: (input: CriarAssociadoPendenteInput) =>
    apiFetch<AssociadoResponse>('/identidade/associados/pendentes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  aprovarAssociadoPendente: (id: string, input: AprovarAssociadoPendenteInput) =>
    apiFetch<AssociadoResponse>(`/identidade/associados/${id}/aprovar`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  atualizarUsuario: (id: string, input: AtualizarUsuarioInput) =>
    apiFetch<UsuarioResponse>(`/identidade/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  atualizarAssociado: (id: string, input: AtualizarAssociadoInput) =>
    apiFetch<AssociadoResponse>(`/identidade/associados/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  excluirAssociado: (id: string) =>
    apiFetch<void>(`/identidade/associados/${id}`, { method: 'DELETE' }),

  atualizarSenha: (id: string, senha: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/senha`, {
      method: 'PATCH',
      body: JSON.stringify({ senha }),
    }),

  ativarUsuario: (id: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/ativar`, { method: 'PATCH' }),

  desativarUsuario: (id: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/desativar`, { method: 'PATCH' }),
}
