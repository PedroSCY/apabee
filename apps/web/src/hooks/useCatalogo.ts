'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  catalogoApi,
  type AdicionarComposicaoInput,
  type AtualizarProdutoInput,
  type CriarProdutoInput,
} from '@/lib/api/catalogo'

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
    mutationFn: ({ id, quantidade, loteOrigemId }: { id: string; quantidade: number; loteOrigemId?: string }) =>
      catalogoApi.gerarEstoque(id, quantidade, loteOrigemId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

export function useCapacidadeLote(produtoId: string, loteId: string | null) {
  return useQuery({
    queryKey: ['capacidade-lote', produtoId, loteId],
    queryFn: () => catalogoApi.consultarCapacidade(produtoId, loteId!),
    enabled: !!loteId,
  })
}

export function useComposicoes(produtoId: string) {
  return useQuery({
    queryKey: ['composicoes', produtoId],
    queryFn: () => catalogoApi.buscarComposicoes(produtoId),
    enabled: !!produtoId,
  })
}

export function useAdicionarComposicao(produtoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AdicionarComposicaoInput) =>
      catalogoApi.adicionarComposicao(produtoId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['composicoes', produtoId] }),
  })
}

export function useRemoverComposicao(produtoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (composicaoId: string) =>
      catalogoApi.removerComposicao(produtoId, composicaoId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['composicoes', produtoId] }),
  })
}

export function useTiposMateriaPrima() {
  return useQuery({
    queryKey: ['tipos-materia-prima'],
    queryFn: catalogoApi.listarTiposMateriaPrima,
    staleTime: 5 * 60 * 1000,
  })
}
