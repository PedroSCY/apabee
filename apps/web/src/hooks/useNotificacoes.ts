'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificacoesApi } from '@/lib/api/notificacoes'

export const NOTIFICACOES_KEY = ['notificacoes'] as const
export const NOTIFICACOES_COUNT_KEY = ['notificacoes-count'] as const

/** Lista as notificações do usuário logado. */
export function useNotificacoes(limit = 50) {
  return useQuery({
    queryKey: [...NOTIFICACOES_KEY, { limit }],
    queryFn: () => notificacoesApi.listar(limit),
    staleTime: 30_000,
  })
}

/** Retorna a contagem de notificações não lidas. */
export function useContarNaoLidas() {
  return useQuery({
    queryKey: NOTIFICACOES_COUNT_KEY,
    queryFn: () => notificacoesApi.contarNaoLidas(),
    staleTime: 20_000,
    refetchInterval: 60_000,
  })
}

/** Marca uma notificação como lida. */
export function useMarcarLida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificacoesApi.marcarLida(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: NOTIFICACOES_KEY })
      void qc.invalidateQueries({ queryKey: NOTIFICACOES_COUNT_KEY })
    },
  })
}

/** Marca todas as notificações como lidas. */
export function useMarcarTodasLidas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificacoesApi.marcarTodasLidas(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: NOTIFICACOES_KEY })
      void qc.invalidateQueries({ queryKey: NOTIFICACOES_COUNT_KEY })
    },
  })
}
