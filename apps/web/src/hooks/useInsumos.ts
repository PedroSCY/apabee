'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  patrimonioApi,
  type AtualizarInsumoInput,
  type CriarInsumoInput,
} from '@/lib/api/patrimonio'

export const INSUMOS_KEY = ['insumos'] as const

export function useInsumos() {
  return useQuery({
    queryKey: INSUMOS_KEY,
    queryFn: patrimonioApi.listarInsumos,
  })
}

export function useBuscarInsumo(id: string) {
  return useQuery({
    queryKey: [...INSUMOS_KEY, id],
    queryFn: () => patrimonioApi.buscarInsumo(id),
    enabled: Boolean(id),
  })
}

export function useCriarInsumo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarInsumoInput) => patrimonioApi.criarInsumo(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}

export function useAtualizarInsumo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AtualizarInsumoInput }) =>
      patrimonioApi.atualizarInsumo(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}

export function useColocarInsumoEmManutencao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.colocarInsumoEmManutencao(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}
