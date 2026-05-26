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

export type DestinatariosAviso = 'TODOS' | 'APENAS_ATIVOS' | 'SELECIONADOS'

export interface AvisoResponse {
  id: string
  titulo: string
  conteudo: string
  categoria: 'GERAL' | 'URGENTE' | 'REUNIAO' | 'FINANCEIRO'
  publicado: boolean
  fixado: boolean
  destinatarios: DestinatariosAviso
  enviarEmail: boolean
  emailEnviado: boolean
  selectedMemberIds: string[]
  dataReuniao?: string | null
  horarioReuniao?: string | null
  localReuniao?: string | null
  criadoEm: string
}

export interface CriarAvisoInput {
  titulo: string
  conteudo: string
  categoria: string
  fixado?: boolean
  publicado?: boolean
  destinatarios?: DestinatariosAviso
  enviarEmail?: boolean
  selectedMemberIds?: string[]
  dataReuniao?: string
  horarioReuniao?: string
  localReuniao?: string
}

export const comunicacaoApi = {
  /** Lista avisos, opcionalmente apenas os publicados. */
  listarAvisos: (apenasPublicados = false) =>
    apiFetch<AvisoResponse[]>(
      `/comunicacao/avisos${apenasPublicados ? '?publicos=true' : ''}`,
    ),

  /** Cria um novo aviso. */
  criarAviso: (input: CriarAvisoInput) =>
    apiFetch<AvisoResponse>('/comunicacao/avisos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Publica um aviso (torna visível). */
  publicarAviso: (id: string) =>
    apiFetch<AvisoResponse>(`/comunicacao/avisos/${id}/publicar`, { method: 'PATCH' }),

  /** Despublica um aviso. */
  despublicarAviso: (id: string) =>
    apiFetch<AvisoResponse>(`/comunicacao/avisos/${id}/despublicar`, { method: 'PATCH' }),

  /** Exclui um aviso. */
  excluirAviso: (id: string) =>
    apiFetch<void>(`/comunicacao/avisos/${id}`, { method: 'DELETE' }),

  /** Envia uma solicitação de contato pública. */
  criarSolicitacaoContato: (input: CriarSolicitacaoContatoInput) =>
    apiFetch<SolicitacaoContatoResponse>('/contato/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Lista solicitações de contato, opcionalmente filtradas por status. */
  listarSolicitacoesContato: (status?: StatusSolicitacaoContato) =>
    apiFetch<SolicitacaoContatoResponse[]>(
      `/contato/solicitacoes${status ? `?status=${status}` : ''}`,
    ),

  /** Atualiza o status de uma solicitação de contato. */
  atualizarStatusSolicitacaoContato: (id: string, status: StatusSolicitacaoContato) =>
    apiFetch<SolicitacaoContatoResponse>(`/contato/solicitacoes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  /** Exclui uma solicitação de contato. */
  excluirSolicitacaoContato: (id: string) =>
    apiFetch<void>(`/contato/solicitacoes/${id}`, { method: 'DELETE' }),
}
