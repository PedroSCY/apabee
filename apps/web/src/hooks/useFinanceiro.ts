'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  financeiroApi,
  type GerarMensalidadesInput,
  type QuitarMensalidadeInput,
  type MarcarIsentoInput,
  type StatusMensalidade,
} from '@/lib/api/financeiro'

export const MOVIMENTOS_KEY = ['movimentos-financeiros'] as const
export const MENSALIDADES_KEY = ['mensalidades'] as const

/** Lista todos os movimentos financeiros (admin). */
export function useMovimentos(params?: { associadoId?: string; campanhaId?: string; limit?: number }) {
  return useQuery({
    queryKey: [...MOVIMENTOS_KEY, params],
    queryFn: () => financeiroApi.listarMovimentos(params),
  })
}

/** Busca movimentos financeiros de um associado específico. */
export function useMovimentosPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...MOVIMENTOS_KEY, 'associado', associadoId],
    queryFn: () => financeiroApi.listarMovimentosPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}

/** Lista mensalidades de uma competência (admin). */
export function useMensalidades(params: { ano?: number; mes?: number; status?: StatusMensalidade }) {
  return useQuery({
    queryKey: [...MENSALIDADES_KEY, params],
    queryFn: () => financeiroApi.listarMensalidades(params),
    enabled: Boolean(params.ano && params.mes),
  })
}

/** Lista mensalidades de um associado (histórico). */
export function useMensalidadesPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...MENSALIDADES_KEY, 'associado', associadoId],
    queryFn: () => financeiroApi.listarMensalidadesPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}

/** Gera mensalidades para a competência informada. */
export function useGerarMensalidades() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: GerarMensalidadesInput) => financeiroApi.gerarMensalidades(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

/** Quita uma mensalidade manualmente. */
export function useQuitarMensalidade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: QuitarMensalidadeInput }) =>
      financeiroApi.quitarMensalidade(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

/** Marca uma mensalidade como isenta. */
export function useMarcarIsentoMensalidade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MarcarIsentoInput }) =>
      financeiroApi.marcarIsentoMensalidade(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

/** Reativa uma mensalidade isenta. */
export function useReativarMensalidade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => financeiroApi.reativarMensalidade(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

/** Emite cobrança PIX no gateway para uma mensalidade PENDENTE. */
export function useEmitirCobranca() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => financeiroApi.emitirCobranca(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

/** Cancela a cobrança ativa no gateway. */
export function useCancelarCobranca() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => financeiroApi.cancelarCobranca(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

/** Exclui uma mensalidade PENDENTE sem cobrança ativa (permite regerar no mesmo mês). */
export function useExcluirMensalidade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => financeiroApi.excluirMensalidade(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

/** Estorna uma mensalidade PAGO, voltando ao status PENDENTE. */
export function useEstornarMensalidade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => financeiroApi.estornarMensalidade(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENSALIDADES_KEY })
    },
  })
}

// ── Hooks do associado logado (/me) ──────────────────────────────────────

export const MINHAS_MENSALIDADES_KEY = ['minhas-mensalidades'] as const
export const MEUS_MOVIMENTOS_KEY = ['meus-movimentos'] as const

/** Retorna as mensalidades do associado logado. */
export function useMinhasMensalidades() {
  return useQuery({
    queryKey: MINHAS_MENSALIDADES_KEY,
    queryFn: () => financeiroApi.minhasMensalidades(),
  })
}

/** Retorna os movimentos financeiros do associado logado. */
export function useMeusMovimentos() {
  return useQuery({
    queryKey: MEUS_MOVIMENTOS_KEY,
    queryFn: () => financeiroApi.meusMovimentos(),
  })
}

/** Emite cobrança PIX para uma mensalidade do associado logado. */
export function useSolicitarPix() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => financeiroApi.solicitarPix(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MINHAS_MENSALIDADES_KEY })
    },
  })
}
