'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gestaoApi, AtualizarConfiguracaoInput, CriarAtaInput, CriarDocumentoInput } from '@/lib/api/gestao'

export const CONFIGURACAO_KEY = ['gestao', 'configuracao']
export const ATAS_KEY = ['gestao', 'atas']
export const DOCUMENTOS_KEY = ['gestao', 'documentos']

// ── Configuração ─────────────────────────────────────────────────────────────

/** Busca configuração da associação. */
export function useConfiguracao() {
  return useQuery({
    queryKey: CONFIGURACAO_KEY,
    queryFn: gestaoApi.obterConfiguracao,
    staleTime: 5 * 60_000,
  })
}

/** Atualiza configuração da associação. */
export function useAtualizarConfiguracao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AtualizarConfiguracaoInput) => gestaoApi.atualizarConfiguracao(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONFIGURACAO_KEY }),
  })
}

// ── Atas ──────────────────────────────────────────────────────────────────────

/** Busca lista de atas registradas. */
export function useAtas() {
  return useQuery({ queryKey: ATAS_KEY, queryFn: gestaoApi.listarAtas })
}

/** Cria uma nova ata de reunião. */
export function useCriarAta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAtaInput) => gestaoApi.criarAta(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATAS_KEY }),
  })
}

/** Publica uma ata para os associados. */
export function usePublicarAta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.publicarAta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATAS_KEY }),
  })
}

/** Despublica uma ata. */
export function useDespublicarAta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.despublicarAta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATAS_KEY }),
  })
}

/** Busca participantes de uma ata. */
export function useParticipantesAta(ataId: string) {
  return useQuery({
    queryKey: [...ATAS_KEY, ataId, 'participantes'],
    queryFn: () => gestaoApi.listarParticipantes(ataId),
    enabled: !!ataId,
  })
}

/** Adiciona participante a uma ata. */
export function useAdicionarParticipante(ataId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (associadoId: string) => gestaoApi.adicionarParticipante(ataId, associadoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ATAS_KEY, ataId, 'participantes'] }),
  })
}

/** Remove participante de uma ata. */
export function useRemoverParticipante(ataId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participanteId: string) => gestaoApi.removerParticipante(ataId, participanteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ATAS_KEY, ataId, 'participantes'] }),
  })
}

// ── Documentos ────────────────────────────────────────────────────────────────

/** Busca documentos por categoria. */
export function useDocumentos(categoria?: string) {
  return useQuery({
    queryKey: [...DOCUMENTOS_KEY, categoria],
    queryFn: () => gestaoApi.listarDocumentos(categoria),
  })
}

/** Cria um novo documento. */
export function useCriarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarDocumentoInput) => gestaoApi.criarDocumento(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

/** Publica um documento para os associados. */
export function usePublicarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.publicarDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

/** Despublica um documento. */
export function useDespublicarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.despublicarDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}

/** Exclui um documento pelo ID. */
export function useExcluirDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gestaoApi.excluirDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTOS_KEY }),
  })
}
