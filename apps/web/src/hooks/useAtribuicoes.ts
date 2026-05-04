'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { patrimonioApi, type AtribuirPatrimonioInput } from '@/lib/api/patrimonio'
import { EQUIPAMENTOS_KEY } from './useEquipamentos'
import { INSUMOS_KEY } from './useInsumos'

const ATRIBUICOES_KEY = ['atribuicoes'] as const

export function useAtribuicoesPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...ATRIBUICOES_KEY, 'associado', associadoId],
    queryFn: () => patrimonioApi.listarAtribuicoesPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}

export function useAtribuirPatrimonio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AtribuirPatrimonioInput) => patrimonioApi.atribuirPatrimonio(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATRIBUICOES_KEY })
      void queryClient.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}

export function useDevolverPatrimonio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.devolverPatrimonio(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATRIBUICOES_KEY })
      void queryClient.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
      void queryClient.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}
