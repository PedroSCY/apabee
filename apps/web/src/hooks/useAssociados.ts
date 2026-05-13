'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  identidadeApi,
  type CriarAssociadoInput,
  type CriarAssociadoPendenteInput,
  type AprovarAssociadoPendenteInput,
  type CriarUsuarioInput,
  type AtualizarUsuarioInput,
  type AtualizarAssociadoInput,
} from '@/lib/api/identidade'

export const ASSOCIADOS_KEY = ['associados'] as const
export const ASSOCIADO_KEY = (id: string) => ['associados', id] as const

export function useAssociados() {
  return useQuery({
    queryKey: ASSOCIADOS_KEY,
    queryFn: identidadeApi.listarAssociados,
  })
}

export function useMeuPerfil() {
  return useQuery({
    queryKey: ['meu-perfil'] as const,
    queryFn: identidadeApi.meuPerfil,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAssociado(id: string) {
  return useQuery({
    queryKey: ASSOCIADO_KEY(id),
    queryFn: () => identidadeApi.buscarAssociado(id),
    enabled: !!id,
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

export function useAtualizarUsuario(usuarioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AtualizarUsuarioInput) => identidadeApi.atualizarUsuario(usuarioId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
      void queryClient.invalidateQueries({ queryKey: ASSOCIADO_KEY(usuarioId) })
    },
  })
}

export function useAtualizarAssociado(associadoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AtualizarAssociadoInput) => identidadeApi.atualizarAssociado(associadoId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
      void queryClient.invalidateQueries({ queryKey: ASSOCIADO_KEY(associadoId) })
    },
  })
}

export function useExcluirAssociado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.excluirAssociado(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

export function useAtualizarSenha(usuarioId: string) {
  return useMutation({
    mutationFn: (senha: string) => identidadeApi.atualizarSenha(usuarioId, senha),
  })
}

export function useCriarAssociadoPendente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAssociadoPendenteInput) => identidadeApi.criarAssociadoPendente(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

export function useAprovarAssociadoPendente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AprovarAssociadoPendenteInput }) =>
      identidadeApi.aprovarAssociadoPendente(id, input),
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
