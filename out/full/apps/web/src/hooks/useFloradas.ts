'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { floradasApi, type CriarFloradaInput } from '@/lib/api/floradas'

export const FLORADAS_KEY = ['floradas'] as const

export function useFloradas() {
  return useQuery({ queryKey: FLORADAS_KEY, queryFn: floradasApi.listar })
}

export function useCriarFlorada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarFloradaInput) => floradasApi.criar(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FLORADAS_KEY }),
  })
}
