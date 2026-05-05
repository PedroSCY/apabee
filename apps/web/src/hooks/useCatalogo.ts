'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogoApi, type AtualizarProdutoInput, type CriarProdutoInput } from '@/lib/api/catalogo'

export const PRODUTOS_KEY = ['produtos'] as const

export function useProdutos(apenasPublicados = false) {
  return useQuery({
    queryKey: [...PRODUTOS_KEY, { apenasPublicados }],
    queryFn: () => catalogoApi.listarProdutos(apenasPublicados),
  })
}

export function useCriarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarProdutoInput) => catalogoApi.criarProduto(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

export function useAtualizarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & AtualizarProdutoInput) =>
      catalogoApi.atualizarProduto(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

export function usePublicarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogoApi.publicarProduto(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

export function useArquivarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogoApi.arquivarProduto(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

export function useGerarEstoque() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantidade }: { id: string; quantidade: number }) =>
      catalogoApi.gerarEstoque(id, quantidade),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}
