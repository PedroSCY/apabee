'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  catalogoApi,
  type AdicionarComposicaoInput,
  type AtualizarProdutoInput,
  type CriarProdutoInput,
} from '@/lib/api/catalogo'

export const PRODUTOS_KEY = ['produtos'] as const

/** Busca lista de produtos do catálogo. */
export function useProdutos(apenasPublicados = false) {
  return useQuery({
    queryKey: [...PRODUTOS_KEY, { apenasPublicados }],
    queryFn: () => catalogoApi.listarProdutos(apenasPublicados),
  })
}

/** Cria um novo produto no catálogo. */
export function useCriarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarProdutoInput) => catalogoApi.criarProduto(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

/** Atualiza dados de um produto. */
export function useAtualizarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & AtualizarProdutoInput) =>
      catalogoApi.atualizarProduto(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

/** Publica um produto no catálogo. */
export function usePublicarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogoApi.publicarProduto(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

/** Arquiwa um produto do catálogo. */
export function useArquivarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogoApi.arquivarProduto(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

/** Gera estoque de um produto a partir de lote. */
export function useGerarEstoque() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantidade, loteOrigemId }: { id: string; quantidade: number; loteOrigemId?: string }) =>
      catalogoApi.gerarEstoque(id, quantidade, loteOrigemId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: PRODUTOS_KEY }),
  })
}

/** Consulta capacidade disponível de um lote. */
export function useCapacidadeLote(produtoId: string, loteId: string | null) {
  return useQuery({
    queryKey: ['capacidade-lote', produtoId, loteId],
    queryFn: () => catalogoApi.consultarCapacidade(produtoId, loteId!),
    enabled: !!loteId,
  })
}

/** Busca composições de um produto. */
export function useComposicoes(produtoId: string) {
  return useQuery({
    queryKey: ['composicoes', produtoId],
    queryFn: () => catalogoApi.buscarComposicoes(produtoId),
    enabled: !!produtoId,
  })
}

/** Adiciona item à composição de um produto. */
export function useAdicionarComposicao(produtoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AdicionarComposicaoInput) =>
      catalogoApi.adicionarComposicao(produtoId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['composicoes', produtoId] }),
  })
}

/** Remove item da composição de um produto. */
export function useRemoverComposicao(produtoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (composicaoId: string) =>
      catalogoApi.removerComposicao(produtoId, composicaoId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['composicoes', produtoId] }),
  })
}

/** Busca lista de tipos de matéria-prima. */
export function useTiposMateriaPrima() {
  return useQuery({
    queryKey: ['tipos-materia-prima'],
    queryFn: catalogoApi.listarTiposMateriaPrima,
    staleTime: 5 * 60 * 1000,
  })
}
