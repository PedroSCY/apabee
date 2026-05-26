'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  campanhasApi,
  type CriarCampanhaInput,
  type RegistrarContribuicaoInput,
  type RegistrarCustoInput,
  type CriarOrdemInput,
  type ConfirmarOrdemInput,
  type RegistrarCotaInput,
  type CriarItemAquisicaoInput,
  type RegistrarPedidoInput,
  type CriarMetaInput,
  type AlocarPoolInput,
} from '@/lib/api/campanhas'
import { POOL_KEY } from './useProducao'

export const CAMPANHAS_KEY = ['campanhas'] as const

export function useCampanhas() {
  return useQuery({ queryKey: CAMPANHAS_KEY, queryFn: campanhasApi.listar })
}

export function useCampanha(id: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, id],
    queryFn: () => campanhasApi.buscar(id),
    enabled: Boolean(id),
  })
}

export function useCriarCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarCampanhaInput) => campanhasApi.criar(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CAMPANHAS_KEY }),
  })
}

export function useIniciarCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => campanhasApi.iniciar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CAMPANHAS_KEY }),
  })
}

export function useConcluirCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => campanhasApi.concluir(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CAMPANHAS_KEY }),
  })
}

export function useCancelarCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => campanhasApi.cancelar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CAMPANHAS_KEY }),
  })
}

export function useDeletarCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => campanhasApi.deletar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CAMPANHAS_KEY }),
  })
}

export function useAtualizarReceita(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (receitaTotal: number) => campanhasApi.atualizarReceita(campanhaId, receitaTotal),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId] }),
  })
}

export function useLiquidarCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => campanhasApi.liquidar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CAMPANHAS_KEY }),
  })
}

export function useContribuicoes(campanhaId: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'contribuicoes'],
    queryFn: () => campanhasApi.listarContribuicoes(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

export function useRegistrarContribuicao(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegistrarContribuicaoInput) =>
      campanhasApi.registrarContribuicao(campanhaId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'contribuicoes'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId] })
    },
  })
}

export function useRemoverContribuicao(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (contribuicaoId: string) =>
      campanhasApi.removerContribuicao(campanhaId, contribuicaoId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'contribuicoes'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'estoque'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'metas'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId] })
      void qc.invalidateQueries({ queryKey: POOL_KEY })
    },
  })
}

export function useCustos(campanhaId: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'custos'],
    queryFn: () => campanhasApi.listarCustos(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

export function useRegistrarCusto(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegistrarCustoInput) =>
      campanhasApi.registrarCusto(campanhaId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'custos'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId] })
    },
  })
}

export function useRemoverCusto(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (custoId: string) => campanhasApi.removerCusto(campanhaId, custoId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'custos'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId] })
    },
  })
}

// --- Ordens de Produção ---
export function useOrdensProducao(campanhaId: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'ordens'],
    queryFn: () => campanhasApi.listarOrdens(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

export function useCriarOrdemProducao(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarOrdemInput) => campanhasApi.criarOrdem(campanhaId, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'ordens'] }),
  })
}

export function useConfirmarOrdemProducao(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ordemId, ...input }: { ordemId: string } & ConfirmarOrdemInput) =>
      campanhasApi.confirmarOrdem(campanhaId, ordemId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'ordens'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'estoque'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'metas'] })
    },
  })
}

export function useRemoverOrdemProducao(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ordemId: string) => campanhasApi.removerOrdem(campanhaId, ordemId),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'ordens'] }),
  })
}

export function useEstornarOrdem(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ordemId: string) => campanhasApi.estornarOrdem(campanhaId, ordemId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'ordens'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'estoque'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'metas'] })
      void qc.invalidateQueries({ queryKey: POOL_KEY })
    },
  })
}

export function useCalcularConsumo(campanhaId: string) {
  return useMutation({
    mutationFn: (ordemId: string) => campanhasApi.calcularConsumo(campanhaId, ordemId),
  })
}

// --- Cotas ---
export function useCotas(campanhaId: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'cotas'],
    queryFn: () => campanhasApi.listarCotas(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

export function useRegistrarCota(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegistrarCotaInput) => campanhasApi.registrarCota(campanhaId, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'cotas'] }),
  })
}

export function useConfirmarCota(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cotaId: string) => campanhasApi.confirmarCota(campanhaId, cotaId),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'cotas'] }),
  })
}

export function useCancelarCota(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cotaId: string) => campanhasApi.cancelarCota(campanhaId, cotaId),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'cotas'] }),
  })
}

// --- Itens de Aquisição ---
export function useItensAquisicao(campanhaId: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'itens'],
    queryFn: () => campanhasApi.listarItens(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

export function useAdicionarItem(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarItemAquisicaoInput) => campanhasApi.adicionarItem(campanhaId, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'itens'] }),
  })
}

export function useRemoverItem(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => campanhasApi.removerItem(campanhaId, itemId),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'itens'] }),
  })
}

export function useDistribuirItens(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => campanhasApi.distribuirItens(campanhaId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'apuracao'] })
    },
  })
}

// --- Apuração ---
export function useApuracao(campanhaId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'apuracao'],
    queryFn: () => campanhasApi.obterApuracao(campanhaId),
    enabled: Boolean(campanhaId) && (options?.enabled !== false),
  })
}

export function useCalcularPreviewRateio(campanhaId: string) {
  return useMutation({
    mutationFn: () => campanhasApi.calcularPreviewRateio(campanhaId),
  })
}

export function useEstoqueCampanha(campanhaId: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'estoque'],
    queryFn: () => campanhasApi.listarEstoque(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

export function useAlocarPool(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AlocarPoolInput) => campanhasApi.alocarPool(campanhaId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'estoque'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'contribuicoes'] })
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'metas'] })
    },
  })
}

// --- Pedidos de Aquisição ---
export function usePedidosAquisicao(campanhaId: string, associadoId?: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'pedidos', associadoId],
    queryFn: () => campanhasApi.listarPedidos(campanhaId, associadoId),
    enabled: Boolean(campanhaId),
  })
}

export function useRegistrarPedido(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegistrarPedidoInput) => campanhasApi.registrarPedido(campanhaId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'pedidos'] }),
  })
}

export function useConfirmarPagamentoPedido(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pedidoId: string) => campanhasApi.confirmarPagamentoPedido(pedidoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'pedidos'] }),
  })
}

export function useMarcarPedidoEntregue(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pedidoId: string) => campanhasApi.marcarPedidoEntregue(pedidoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'pedidos'] }),
  })
}

// --- Metas de Produção ---
export function useMetasProducao(campanhaId: string) {
  return useQuery({
    queryKey: [...CAMPANHAS_KEY, campanhaId, 'metas'],
    queryFn: () => campanhasApi.listarMetas(campanhaId),
    enabled: Boolean(campanhaId),
  })
}

export function useCriarMeta(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarMetaInput) => campanhasApi.criarMeta(campanhaId, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'metas'] }),
  })
}

export function useRemoverMeta(campanhaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (metaId: string) => campanhasApi.removerMeta(campanhaId, metaId),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...CAMPANHAS_KEY, campanhaId, 'metas'] }),
  })
}
