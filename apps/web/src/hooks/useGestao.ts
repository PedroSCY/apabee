'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gestaoApi, AtualizarConfiguracaoInput, CriarAtaInput, CriarDocumentoInput } from '@/lib/api/gestao'

export const CONFIGURACAO_KEY = ['gestao', 'configuracao']
export const ATAS_KEY = ['gestao', 'atas']
export const DOCUMENTOS_KEY = ['gestao', 'documentos']

// ── Configuração ─────────────────────────────────────────────────────────────

export function useConfiguracao() {
  return useQuery({
    queryKey: CONFIGURACAO_KEY,
    queryFn: gestaoApi.obterConfiguracao,
    staleTime: 5 * 60_000,
  })
}

export function useAtualizarConfiguracao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AtualizarConfiguracaoInput) => gestaoApi.atualizarConfiguracao(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONFIGURACAO_KEY }),
  })
}

// ── Atas ──────────────────────────────────────────────────────────────────────

export function useAtas() {
  return useQuery({ queryKey: ATAS_KEY, queryFn: gestaoApi.listarAtas })
}

export function useCriarAta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAtaInput) => gestaoApi.criarAta(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATAS_KEY }),
  })
}

export function usePublicarAta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.publicarAta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATAS_KEY }),
  })
}

export function useDespublicarAta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.despublicarAta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATAS_KEY }),
  })
}

export function useParticipantesAta(ataId: string) {
  return useQuery({
    queryKey: [...ATAS_KEY, ataId, 'participantes'],
    queryFn: () => gestaoApi.listarParticipantes(ataId),
    enabled: !!ataId,
  })
}

export function useAdicionarParticipante(ataId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (associadoId: string) => gestaoApi.adicionarParticipante(ataId, associadoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ATAS_KEY, ataId, 'participantes'] }),
  })
}

export function useRemoverParticipante(ataId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participanteId: string) => gestaoApi.removerParticipante(ataId, participanteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ATAS_KEY, ataId, 'participantes'] }),
  })
}

// ── Documentos ────────────────────────────────────────────────────────────────

export function useDocumentos(categoria?: string) {
  return useQuery({
    queryKey: [...DOCUMENTOS_KEY, categoria],
    queryFn: () => gestaoApi.listarDocumentos(categoria),
  })
}

export function useCriarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarDocumentoInput) => gestaoApi.criarDocumento(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

export function usePublicarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.publicarDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

export function useDespublicarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.despublicarDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

export function useExcluirDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.excluirDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}
