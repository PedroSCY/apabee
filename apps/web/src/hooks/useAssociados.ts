'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { identidadeApi, type CriarAssociadoInput, type CriarUsuarioInput } from '@/lib/api/identidade'

export const ASSOCIADOS_KEY = ['associados'] as const

export function useAssociados() {
  return useQuery({
    queryKey: ASSOCIADOS_KEY,
    queryFn: identidadeApi.listarAssociados,
  })
}

export function useCriarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarUsuarioInput) => identidadeApi.criarUsuario(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

export function useCriarAssociado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAssociadoInput) => identidadeApi.criarAssociado(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

export function useAtivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.ativarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

export function useDesativarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.desativarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}
