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
  cpf?: string
  usuario: UsuarioResponse
  dataIngresso: string
  observacoes?: string
  status: string
  isentoMensalidade: boolean
}

export interface CriarAssociadoInput {
  usuarioId: string
  cpf?: string
  dataIngresso?: string
  observacoes?: string
}

export interface CriarAssociadoPendenteInput {
  nome: string
  email: string
  cpf?: string
  telefone?: string
  observacoes?: string
}

export interface AprovarAssociadoPendenteInput {
  senha: string
  cpf?: string
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
  cpf?: string
  dataIngresso?: string
  observacoes?: string
  status?: string
}

export const identidadeApi = {
  /** Retorna perfil do associado logado. */
  meuPerfil: () => apiFetch<AssociadoResponse>('/identidade/me'),

  /** Lista todos os associados cadastrados. */
  listarAssociados: () => apiFetch<AssociadoResponse[]>('/identidade/associados'),

  /** Busca um associado pelo ID. */
  buscarAssociado: (id: string) => apiFetch<AssociadoResponse>(`/identidade/associados/${id}`),

  /** Cria um novo usuário no sistema. */
  criarUsuario: (input: CriarUsuarioInput) =>
    apiFetch<UsuarioResponse>('/identidade/usuarios', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Vincula um associado a um usuário existente. */
  criarAssociado: (input: CriarAssociadoInput) =>
    apiFetch<AssociadoResponse>('/identidade/associados', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Cria um associado pendente de aprovação (sem usuário). */
  criarAssociadoPendente: (input: CriarAssociadoPendenteInput) =>
    apiFetch<AssociadoResponse>('/identidade/associados/pendentes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Aprova um associado pendente, criando o usuário com senha. */
  aprovarAssociadoPendente: (id: string, input: AprovarAssociadoPendenteInput) =>
    apiFetch<AssociadoResponse>(`/identidade/associados/${id}/aprovar`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Atualiza dados de um usuário. */
  atualizarUsuario: (id: string, input: AtualizarUsuarioInput) =>
    apiFetch<UsuarioResponse>(`/identidade/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Atualiza dados de um associado. */
  atualizarAssociado: (id: string, input: AtualizarAssociadoInput) =>
    apiFetch<AssociadoResponse>(`/identidade/associados/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Exclui um associado pelo ID. */
  excluirAssociado: (id: string) =>
    apiFetch<void>(`/identidade/associados/${id}`, { method: 'DELETE' }),

  /** Altera a senha de um usuário. */
  atualizarSenha: (id: string, senha: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/senha`, {
      method: 'PATCH',
      body: JSON.stringify({ senha }),
    }),

  /** Ativa um usuário desativado. */
  ativarUsuario: (id: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/ativar`, { method: 'PATCH' }),

  /** Desativa um usuário ativo. */
  desativarUsuario: (id: string) =>
    apiFetch<void>(`/identidade/usuarios/${id}/desativar`, { method: 'PATCH' }),

  /** Marca isenção estrutural de mensalidade (não receberá mensalidades em batches futuros). */
  marcarIsentoAssociado: (id: string) =>
    apiFetch<AssociadoResponse>(`/identidade/associados/${id}/isencao-mensalidade`, { method: 'PATCH' }),

  /** Remove isenção estrutural de mensalidade. */
  removerIsencaoAssociado: (id: string) =>
    apiFetch<AssociadoResponse>(`/identidade/associados/${id}/isencao-mensalidade`, { method: 'DELETE' }),
}
