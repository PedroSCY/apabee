import { TipoNotificacao } from '@apa/shared'

// ─── Notificação ─────────────────────────────────────────────────────────────

export interface NotificacaoResponse {
  id: string
  tipo: TipoNotificacao
  titulo: string
  corpo?: string
  dadosExtras?: Record<string, unknown>
  lida: boolean
  criadoEm: Date
}

// ─── Contagem de Não Lidas ────────────────────────────────────────────────────

export interface ContarNaoLidasResponse {
  count: number
}
