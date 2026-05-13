'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { patrimonioApi, type CriarSolicitacaoInput } from '@/lib/api/patrimonio'
import { EQUIPAMENTOS_KEY } from './useEquipamentos'
import { INSUMOS_KEY } from './useInsumos'

export const SOLICITACOES_KEY = ['solicitacoes'] as const

export function useSolicitacoes(status?: string) {
  return useQuery({
    queryKey: [...SOLICITACOES_KEY, status],
    queryFn: () => patrimonioApi.listarSolicitacoes(status),
  })
}

export function useCriarSolicitacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarSolicitacaoInput) => patrimonioApi.criarSolicitacao(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SOLICITACOES_KEY }),
  })
}

export function useAprovarSolicitacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.aprovarSolicitacao(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SOLICITACOES_KEY })
      void qc.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
      void qc.invalidateQueries({ queryKey: INSUMOS_KEY })
    },
  })
}

export function useRejeitarSolicitacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.rejeitarSolicitacao(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SOLICITACOES_KEY }),
  })
}
