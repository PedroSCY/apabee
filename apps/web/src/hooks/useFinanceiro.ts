'use client'

import { useQuery } from '@tanstack/react-query'
import { financeiroApi } from '@/lib/api/financeiro'

export const MOVIMENTOS_KEY = ['movimentos-financeiros'] as const

export function useMovimentosPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...MOVIMENTOS_KEY, 'associado', associadoId],
    queryFn: () => financeiroApi.listarMovimentosPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}
