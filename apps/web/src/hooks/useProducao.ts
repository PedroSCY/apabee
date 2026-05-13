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
/** Busca lista de tipos de matéria-prima. */
export function useTiposMateriaPrima() {
  return useQuery({ queryKey: TIPOS_KEY, queryFn: producaoApi.listarTipos })
}

/** Cadastra um novo tipo de matéria-prima. */
export function useCriarTipoMateriaPrima() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarTipoMateriaPrimaInput) => producaoApi.criarTipo(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TIPOS_KEY }),
  })
}

// Lotes
/** Busca lista de todos os lotes. */
export function useLotes() {
  return useQuery({ queryKey: LOTES_KEY, queryFn: producaoApi.listarLotes })
}

/** Cria um novo lote de produção ou aquisição. */
export function useCriarLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarLoteInput) => producaoApi.criarLote(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: LOTES_KEY }),
  })
}

/** Encerra um lote ativo. */
export function useEncerrarLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => producaoApi.encerrarLote(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: LOTES_KEY }),
  })
}

// Colheitas
/** Busca colheitas de um associado. */
export function useColheitasPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...COLHEITAS_KEY, 'associado', associadoId],
    queryFn: () => producaoApi.listarColheitasPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}

/** Busca colheitas de um lote. */
export function useColheitasPorLote(loteId: string) {
  return useQuery({
    queryKey: [...COLHEITAS_KEY, 'lote', loteId],
    queryFn: () => producaoApi.listarColheitasPorLote(loteId),
    enabled: Boolean(loteId),
  })
}

/** Registra uma nova colheita. */
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
/** Busca participações de um lote. */
export function useParticipacoesPorLote(loteId: string) {
  return useQuery({
    queryKey: [...PARTICIPACOES_KEY, loteId],
    queryFn: () => producaoApi.listarParticipacoes(loteId),
    enabled: Boolean(loteId),
  })
}

/** Busca participações de um associado. */
export function useParticipacoesPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...PARTICIPACOES_KEY, 'associado', associadoId],
    queryFn: () => producaoApi.listarParticipacoesPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}

/** Registra participação de associado em lote. */
export function useRegistrarParticipacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ loteId, input }: { loteId: string; input: RegistrarParticipacaoInput }) =>
      producaoApi.registrarParticipacao(loteId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PARTICIPACOES_KEY }),
  })
}

/** Atualiza participação de associado em lote. */
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

/** Calcula rateio financeiro de um lote. */
export function useCalcularRateio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (loteId: string) => producaoApi.calcularRateio(loteId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PARTICIPACOES_KEY }),
  })
}
