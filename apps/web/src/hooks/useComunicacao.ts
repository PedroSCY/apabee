'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { comunicacaoApi, type CriarAvisoInput } from '@/lib/api/comunicacao'

export const AVISOS_KEY = ['avisos'] as const

export function useAvisos(apenasPublicados = false) {
  return useQuery({
    queryKey: [...AVISOS_KEY, { apenasPublicados }],
    queryFn: () => comunicacaoApi.listarAvisos(apenasPublicados),
  })
}

export function useCriarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAvisoInput) => comunicacaoApi.criarAviso(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export function usePublicarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.publicarAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export function useDespublicarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.despublicarAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export function useExcluirAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.excluirAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}
