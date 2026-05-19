'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  producaoApi,
  type CriarColheitaInput,
  type CriarTipoMateriaPrimaInput,
} from '@/lib/api/producao'

export const TIPOS_KEY = ['tipos-materia-prima'] as const
export const COLHEITAS_KEY = ['colheitas'] as const
export const POOL_KEY = ['estoque-pool'] as const

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

/** Deleta um tipo de matéria-prima. */
export function useDeletarTipoMateriaPrima() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => producaoApi.deletarTipo(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TIPOS_KEY }),
  })
}

// Colheitas
/** Busca todas as colheitas (visão admin). */
export function useColheitas() {
  return useQuery({ queryKey: COLHEITAS_KEY, queryFn: producaoApi.listarColheitas })
}

/** Busca colheitas de um associado. */
export function useColheitasPorAssociado(associadoId: string) {
  return useQuery({
    queryKey: [...COLHEITAS_KEY, 'associado', associadoId],
    queryFn: () => producaoApi.listarColheitasPorAssociado(associadoId),
    enabled: Boolean(associadoId),
  })
}

/** Busca colheitas de uma campanha. */
export function useColheitasPorCampanha(campanhaId: string) {
  return useQuery({
    queryKey: [...COLHEITAS_KEY, 'campanha', campanhaId],
    queryFn: () => producaoApi.listarColheitasPorCampanha(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

/** Consulta saldo do pool de matéria-prima. */
export function useEstoquePool() {
  return useQuery({ queryKey: POOL_KEY, queryFn: producaoApi.consultarPool })
}

/** Registra uma nova colheita. */
export function useCriarColheita() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarColheitaInput) => producaoApi.criarColheita(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: COLHEITAS_KEY }),
  })
}

/** Remove item do pool quando saldo é zero. */
export function useDeletarItemPool() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tipoId: string) => producaoApi.deletarItemPool(tipoId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: POOL_KEY }),
  })
}

/** Exclui uma colheita (somente se o estoque não foi consumido). */
export function useDeletarColheita() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => producaoApi.deletarColheita(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: COLHEITAS_KEY }),
  })
}
