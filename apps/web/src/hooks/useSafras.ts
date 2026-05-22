'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  safrasApi,
  type CriarSafraInput,
} from '@/lib/api/safras'

export const SAFRAS_KEY = ['safras'] as const

export function useSafras() {
  return useQuery({ queryKey: SAFRAS_KEY, queryFn: safrasApi.listar })
}

export function useCriarSafra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarSafraInput) => safrasApi.criar(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SAFRAS_KEY }),
  })
}

export function useIniciarSafra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => safrasApi.iniciar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SAFRAS_KEY }),
  })
}

export function useEncerrarSafra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => safrasApi.encerrar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SAFRAS_KEY }),
  })
}

export function useDeletarSafra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => safrasApi.deletar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SAFRAS_KEY }),
  })
}
