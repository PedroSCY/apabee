'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type SseEventTipo = string

interface SseEvent {
  tipo: SseEventTipo
  id?: string
  timestamp: string
  dados?: Record<string, unknown>
}

/** Mapa de evento SSE → query keys a invalidar. */
const INVALIDATION_MAP: Record<string, string[][]> = {
  // Financeiro
  'financeiro:mensalidade-quitada':   [['mensalidades'], ['minhas-mensalidades'], ['meus-movimentos']],
  'financeiro:mensalidade-isenta':    [['mensalidades'], ['minhas-mensalidades']],
  'financeiro:mensalidade-reativada': [['mensalidades'], ['minhas-mensalidades']],
  'financeiro:mensalidade-estornada': [['mensalidades'], ['minhas-mensalidades']],
  'financeiro:mensalidade-gerada':    [['mensalidades'], ['minhas-mensalidades']],
  'financeiro:mensalidade-excluida':  [['mensalidades'], ['minhas-mensalidades']],
  'financeiro:cobranca-emitida':      [['mensalidades'], ['minhas-mensalidades']],
  'financeiro:cobranca-cancelada':    [['mensalidades'], ['minhas-mensalidades']],
  // Identidade
  'identidade:associado-criado':    [['associados']],
  'identidade:associado-aprovado':  [['associados']],
  'identidade:associado-atualizado':[['associados']],
  'identidade:associado-excluido':  [['associados']],
  'identidade:usuario-ativado':     [['associados']],
  'identidade:usuario-desativado':  [['associados']],
  'identidade:isencao-marcada':     [['associados']],
  'identidade:isencao-removida':    [['associados']],
  // Produção — contribuicoes/cotas/ordens/estoque são sub-queries de campanhas (prefixo ['campanhas'])
  'producao:campanha-criada':         [['campanhas']],
  'producao:campanha-iniciada':       [['campanhas']],
  'producao:campanha-concluida':      [['campanhas']],
  'producao:campanha-cancelada':      [['campanhas']],
  'producao:campanha-liquidada':      [['campanhas'], ['movimentos-financeiros'], ['meus-movimentos']],
  'producao:contribuicao-registrada': [['campanhas']],
  'producao:contribuicao-removida':   [['campanhas']],
  'producao:cota-registrada':         [['campanhas']],
  'producao:cota-confirmada':         [['campanhas']],
  'producao:cota-cancelada':          [['campanhas']],
  'producao:ordem-executada':         [['campanhas'], ['colheitas'], ['estoque-pool']],
  'producao:colheita-confirmada':     [['colheitas'], ['estoque-pool']],
  // Gestão
  'gestao:documento-publicado':    [['gestao', 'documentos']],
  'gestao:documento-despublicado': [['gestao', 'documentos']],
  'gestao:ata-criada':             [['gestao', 'atas']],
  'gestao:ata-atualizada':         [['gestao', 'atas']],
  // Comunicação
  'comunicacao:aviso-publicado':    [['avisos']],
  'comunicacao:aviso-despublicado': [['avisos']],
  // Catálogo
  'catalogo:produto-atualizado': [['produtos']],
  // Patrimônio
  'patrimonio:solicitacao-criada':    [['solicitacoes']],
  'patrimonio:solicitacao-aprovada':  [['solicitacoes']],
  'patrimonio:solicitacao-rejeitada': [['solicitacoes']],
  // Notificações — atualiza sino e lista em tempo real
  'notificacao:nova': [['notificacoes'], ['notificacoes-count']],
}

/** Subscreve ao stream SSE da API e invalida queries React Query ao receber eventos. */
export function useSseEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let es: EventSource | null = null
    let closed = false

    async function connect() {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token || closed) return

      es = new EventSource(`${API_URL}/sse/events?token=${encodeURIComponent(token)}`)

      es.onmessage = (e: MessageEvent<string>) => {
        try {
          const event = JSON.parse(e.data) as SseEvent
          const keys = INVALIDATION_MAP[event.tipo]
          if (!keys) return
          keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
        } catch {
          // payload inesperado — ignorar
        }
      }

      es.onerror = () => {
        es?.close()
        if (!closed) setTimeout(connect, 5_000)
      }
    }

    void connect()

    return () => {
      closed = true
      es?.close()
    }
  }, [queryClient])
}
