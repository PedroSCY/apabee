import { apiFetch } from './client'

export type TipoSolicitacaoContato = 'CONTATO' | 'COLETA' | 'INTEGRACAO'
export type StatusSolicitacaoContato = 'PENDENTE' | 'VISUALIZADA' | 'RESOLVIDA'

export interface SolicitacaoContatoResponse {
  id: string
  tipo: TipoSolicitacaoContato
  status: StatusSolicitacaoContato
  nome: string
  email: string
  telefone?: string
  mensagem: string
  localizacao?: string
  municipio?: string
  criadoEm: string
}

export interface CriarSolicitacaoContatoInput {
  tipo: TipoSolicitacaoContato
  nome: string
  email: string
  telefone?: string
  mensagem: string
  localizacao?: string
  municipio?: string
}

export interface AvisoResponse {
  id: string
  titulo: string
  conteudo: string
  categoria: 'GERAL' | 'URGENTE' | 'REUNIAO' | 'FINANCEIRO'
  publicado: boolean
  fixado: boolean
  criadoEm: string
}

export interface CriarAvisoInput {
  titulo: string
  conteudo: string
  categoria: string
  fixado?: boolean
  publicado?: boolean
}

export const comunicacaoApi = {
  listarAvisos: (apenasPublicados = false) =>
    apiFetch<AvisoResponse[]>(
      `/comunicacao/avisos${apenasPublicados ? '?publicos=true' : ''}`,
    ),

  criarAviso: (input: CriarAvisoInput) =>
    apiFetch<AvisoResponse>('/comunicacao/avisos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  publicarAviso: (id: string) =>
    apiFetch<AvisoResponse>(`/comunicacao/avisos/${id}/publicar`, { method: 'PATCH' }),

  despublicarAviso: (id: string) =>
    apiFetch<AvisoResponse>(`/comunicacao/avisos/${id}/despublicar`, { method: 'PATCH' }),

  excluirAviso: (id: string) =>
    apiFetch<void>(`/comunicacao/avisos/${id}`, { method: 'DELETE' }),

  criarSolicitacaoContato: (input: CriarSolicitacaoContatoInput) =>
    apiFetch<SolicitacaoContatoResponse>('/contato/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  listarSolicitacoesContato: (status?: StatusSolicitacaoContato) =>
    apiFetch<SolicitacaoContatoResponse[]>(
      `/contato/solicitacoes${status ? `?status=${status}` : ''}`,
    ),

  atualizarStatusSolicitacaoContato: (id: string, status: StatusSolicitacaoContato) =>
    apiFetch<SolicitacaoContatoResponse>(`/contato/solicitacoes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  excluirSolicitacaoContato: (id: string) =>
    apiFetch<void>(`/contato/solicitacoes/${id}`, { method: 'DELETE' }),
}
