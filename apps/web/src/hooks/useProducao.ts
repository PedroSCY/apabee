'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  producaoApi,
  type AtualizarParticipacaoInput,
  type CriarColheitaInput,
  type CriarLoteInput,
  type CriarTipoMateriaPrimaInput,
  type RegistrarParticipacaoInput,
} from '@/lib/api/producao'

export const TIPOS_KEY = ['tipos-materia-prima'] as const
export const LOTES_KEY = ['lotes'] as const
export const COLHEITAS_KEY = ['colheitas'] as const
export const PARTICIPACOES_KEY = ['participacoes'] as const

// Tipos de matéria-prima
export function useTiposMateriaPrima() {
  return useQuery({ queryKey: TIPOS_KEY, queryFn: producaoApi.listarTipos })
}

export function useCriarTipoMateriaPrima() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarTipoMateriaPrimaInput) => producaoApi.criarTipo(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TIPOS_KEY }),
  })
}

// Lotes
export function useLotes() {
  return useQuery({ queryKey: LOTES_KEY, queryFn: producaoApi.listarLotes })
}

export function useCriarLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarLoteInput) => producaoApi.criarLote(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: LOTES_KEY }),
  })
}

export function useEncerrarLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => producaoApi.encerrarLote(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: LOTES_KEY }),
  })
}

// Colheitas
export function useColheitasPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...COLHEITAS_KEY, 'associado', associadoId],
    queryFn: () => producaoApi.listarColheitasPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}

export function useColheitasPorLote(loteId: string) {
  return useQuery({
    queryKey: [...COLHEITAS_KEY, 'lote', loteId],
    queryFn: () => producaoApi.listarColheitasPorLote(loteId),
    enabled: Boolean(loteId),
  })
}

export function useCriarColheita() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarColheitaInput) => producaoApi.criarColheita(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: COLHEITAS_KEY })
      void qc.invalidateQueries({ queryKey: LOTES_KEY })
    },
  })
}

// Participações
export function useParticipacoesPorLote(loteId: string) {
  return useQuery({
    queryKey: [...PARTICIPACOES_KEY, loteId],
    queryFn: () => producaoApi.listarParticipacoes(loteId),
    enabled: Boolean(loteId),
  })
}

export function useRegistrarParticipacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ loteId, input }: { loteId: string; input: RegistrarParticipacaoInput }) =>
      producaoApi.registrarParticipacao(loteId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PARTICIPACOES_KEY }),
  })
}

export function useAtualizarParticipacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      loteId,
      associadoId,
      input,
    }: {
      loteId: string
      associadoId: string
      input: AtualizarParticipacaoInput
    }) => producaoApi.atualizarParticipacao(loteId, associadoId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PARTICIPACOES_KEY }),
  })
}
