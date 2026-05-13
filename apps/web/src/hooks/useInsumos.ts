'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  patrimonioApi,
  type AtualizarInsumoInput,
  type CriarInsumoInput,
} from '@/lib/api/patrimonio'

export const INSUMOS_KEY = ['insumos'] as const

/** Busca lista de todos os insumos. */
export function useInsumos() {
  return useQuery({
    queryKey: INSUMOS_KEY,
    queryFn: patrimonioApi.listarInsumos,
  })
}

/** Busca um insumo pelo ID. */
export function useBuscarInsumo(id: string) {
  return useQuery({
    queryKey: [...INSUMOS_KEY, id],
    queryFn: () => patrimonioApi.buscarInsumo(id),
    enabled: Boolean(id),
  })
}

/** Cadastra um novo insumo. */
export function useCriarInsumo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarInsumoInput) => patrimonioApi.criarInsumo(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}

/** Atualiza dados de um insumo. */
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

/** Marca insumo como em manutenção. */
export function useColocarInsumoEmManutencao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.colocarInsumoEmManutencao(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}

/** Libera insumo da manutenção. */
export function useLiberarInsumoManutencao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.liberarInsumoManutencao(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}

/** Exclui um insumo pelo ID. */
export function useExcluirInsumo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.excluirInsumo(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}
