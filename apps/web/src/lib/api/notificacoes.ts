import { apiFetch } from './client'

export type TipoNotificacao =
  | 'APROVACAO_CADASTRO'
  | 'MENSALIDADE_GERADA'
  | 'COBRANCA_PIX_EMITIDA'
  | 'RATEIO_DISPONIVEL'
  | 'NOVO_ASSOCIADO_PENDENTE'
  | 'SOLICITACAO_APROVADA'
  | 'SOLICITACAO_REJEITADA'
  | 'NOVA_SOLICITACAO_PATRIMONIO'
  | 'NOVA_SOLICITACAO_CONTATO'
  | 'NOVO_AVISO'
  | 'ATA_PUBLICADA'

export interface NotificacaoResponse {
  id: string
  tipo: TipoNotificacao
  titulo: string
  corpo?: string
  dadosExtras?: Record<string, unknown>
  lida: boolean
  criadoEm: string
}

export const notificacoesApi = {
  /** Lista notificações do usuário logado. */
  listar: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : ''
    return apiFetch<NotificacaoResponse[]>(`/notificacoes${qs}`)
  },

  /** Retorna contagem de não lidas. */
  contarNaoLidas: () =>
    apiFetch<{ count: number }>('/notificacoes/nao-lidas/count'),

  /** Marca uma notificação como lida. */
  marcarLida: (id: string) =>
    apiFetch<NotificacaoResponse | null>(`/notificacoes/${id}/lida`, { method: 'PATCH' }),

  /** Marca todas as notificações como lidas. */
  marcarTodasLidas: () =>
    apiFetch<void>('/notificacoes/marcar-todas-lidas', { method: 'PATCH' }),
}
