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

/** Busca lista de todos os associados. */
export function useAssociados() {
  return useQuery({
    queryKey: ASSOCIADOS_KEY,
    queryFn: identidadeApi.listarAssociados,
  })
}

/** Busca perfil do usuário logado. */
export function useMeuPerfil() {
  return useQuery({
    queryKey: ['meu-perfil'] as const,
    queryFn: identidadeApi.meuPerfil,
    staleTime: 5 * 60 * 1000,
  })
}

/** Busca um associado pelo ID. */
export function useAssociado(id: string) {
  return useQuery({
    queryKey: ASSOCIADO_KEY(id),
    queryFn: () => identidadeApi.buscarAssociado(id),
    enabled: !!id,
  })
}

/** Cria um novo usuário no sistema. */
export function useCriarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarUsuarioInput) => identidadeApi.criarUsuario(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

/** Cria um novo associado. */
export function useCriarAssociado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAssociadoInput) => identidadeApi.criarAssociado(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

/** Atualiza dados de um usuário. */
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

/** Atualiza dados de um associado. */
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

/** Exclui um associado pelo ID. */
export function useExcluirAssociado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.excluirAssociado(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

/** Atualiza a senha de um usuário. */
export function useAtualizarSenha(usuarioId: string) {
  return useMutation({
    mutationFn: (senha: string) => identidadeApi.atualizarSenha(usuarioId, senha),
  })
}

/** Cria um associado com status pendente. */
export function useCriarAssociadoPendente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAssociadoPendenteInput) => identidadeApi.criarAssociadoPendente(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

/** Aprova um associado pendente. */
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

/** Ativa um usuário do sistema. */
export function useAtivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.ativarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

/** Desativa um usuário do sistema. */
export function useDesativarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.desativarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
    },
  })
}

/** Marca isenção estrutural de mensalidade para o associado. */
export function useMarcarIsentoAssociado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.marcarIsentoAssociado(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
      void queryClient.invalidateQueries({ queryKey: ASSOCIADO_KEY(id) })
    },
  })
}

/** Remove isenção estrutural de mensalidade do associado. */
export function useRemoverIsencaoAssociado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => identidadeApi.removerIsencaoAssociado(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ASSOCIADOS_KEY })
      void queryClient.invalidateQueries({ queryKey: ASSOCIADO_KEY(id) })
    },
  })
}
