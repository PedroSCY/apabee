'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  patrimonioApi,
  type AdicionarUnidadesInput,
  type AtualizarTipoInsumoInput,
  type CriarTipoInsumoInput,
} from '@/lib/api/patrimonio'

export const TIPOS_INSUMO_KEY = ['tipos-insumo'] as const
export const INSUMOS_KEY = ['insumos'] as const
export const TIPO_INSUMO_KEY = (id: string) => [...TIPOS_INSUMO_KEY, id] as const

/** Lista todos os tipos de insumo. */
export function useTiposInsumo() {
  return useQuery({
    queryKey: TIPOS_INSUMO_KEY,
    queryFn: patrimonioApi.listarTiposInsumo,
  })
}

/** Lista unidades de insumo, opcionalmente filtradas por tipo. */
export function useInsumos(tipoId?: string) {
  return useQuery({
    queryKey: tipoId ? [...INSUMOS_KEY, tipoId] : INSUMOS_KEY,
    queryFn: () => patrimonioApi.listarInsumos(tipoId),
  })
}

/** Lista unidades de um tipo específico. */
export function useUnidadesPorTipo(tipoId: string) {
  return useQuery({
    queryKey: [...TIPOS_INSUMO_KEY, tipoId, 'unidades'] as const,
    queryFn: () => patrimonioApi.listarUnidadesPorTipo(tipoId),
    enabled: Boolean(tipoId),
  })
}

/** Cria um novo tipo de insumo. */
export function useCriarTipoInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarTipoInsumoInput) => patrimonioApi.criarTipoInsumo(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TIPOS_INSUMO_KEY }),
  })
}

/** Atualiza um tipo de insumo. */
export function useAtualizarTipoInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AtualizarTipoInsumoInput }) =>
      patrimonioApi.atualizarTipoInsumo(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TIPOS_INSUMO_KEY }),
  })
}

/** Exclui um tipo de insumo. */
export function useExcluirTipoInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.excluirTipoInsumo(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TIPOS_INSUMO_KEY }),
  })
}

/** Adiciona N unidades a um tipo de insumo. */
export function useAdicionarUnidades() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tipoId, input }: { tipoId: string; input: AdicionarUnidadesInput }) =>
      patrimonioApi.adicionarUnidades(tipoId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: INSUMOS_KEY }),
  })
}

/** Coloca unidade de insumo em manutenção. */
export function useColocarInsumoEmManutencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.colocarInsumoEmManutencao(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: INSUMOS_KEY }),
  })
}

/** Libera unidade de insumo da manutenção. */
export function useLiberarInsumoManutencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.liberarInsumoManutencao(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: INSUMOS_KEY }),
  })
}

/** Exclui uma unidade de insumo. */
export function useExcluirInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.excluirInsumo(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: INSUMOS_KEY })
      void qc.invalidateQueries({ queryKey: TIPOS_INSUMO_KEY })
    },
  })
}
