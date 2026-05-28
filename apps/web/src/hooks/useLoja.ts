'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  lojaApi,
  type AtualizarConfiguracaoLojaInput,
  type AtualizarEnderecoInput,
  type CheckoutInput,
  type CriarEnderecoInput,
  type ListarPedidosParams,
} from '@/lib/api/loja'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const CLIENTE_LOJA_KEY = ['shop-cliente'] as const
export const ENDERECOS_KEY = ['shop-enderecos'] as const
export const MEUS_PEDIDOS_KEY = ['shop-meus-pedidos'] as const
export const PEDIDO_LOJA_KEY = (id: string) => ['shop-pedido', id] as const
export const ADMIN_PEDIDOS_LOJA_KEY = ['admin-pedidos-loja'] as const
export const ADMIN_PEDIDO_LOJA_KEY = (id: string) => ['admin-pedido-loja', id] as const
export const ADMIN_CLIENTES_LOJA_KEY = ['admin-clientes-loja'] as const
export const CONFIGURACAO_LOJA_PUBLICA_KEY = ['loja-config-publica'] as const
export const CONFIGURACAO_LOJA_ADMIN_KEY = ['loja-config-admin'] as const

// ─── Cliente ──────────────────────────────────────────────────────────────────

/** Retorna dados do cliente autenticado. */
export function useClienteLoja() {
  return useQuery({
    queryKey: CLIENTE_LOJA_KEY,
    queryFn: () => lojaApi.obterCliente(),
    retry: false,
  })
}

/** Atualiza nome e/ou telefone do cliente. */
export function useAtualizarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { nome?: string; telefone?: string }) => lojaApi.atualizarCliente(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CLIENTE_LOJA_KEY }),
  })
}

// ─── Endereços ────────────────────────────────────────────────────────────────

/** Retorna endereços de entrega do cliente. */
export function useEnderecosCliente() {
  return useQuery({
    queryKey: ENDERECOS_KEY,
    queryFn: () => lojaApi.listarEnderecos(),
  })
}

/** Cria um novo endereço de entrega. */
export function useCriarEndereco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarEnderecoInput) => lojaApi.criarEndereco(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ENDERECOS_KEY }),
  })
}

/** Atualiza um endereço de entrega. */
export function useAtualizarEndereco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & AtualizarEnderecoInput) =>
      lojaApi.atualizarEndereco(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ENDERECOS_KEY }),
  })
}

/** Remove um endereço de entrega. */
export function useRemoverEndereco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lojaApi.removerEndereco(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ENDERECOS_KEY }),
  })
}

/** Define um endereço como principal. */
export function useDefinirEnderecoPrincipal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lojaApi.definirEnderecoPrincipal(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ENDERECOS_KEY }),
  })
}

// ─── Checkout e Pedidos ───────────────────────────────────────────────────────

/** Realiza o checkout (cria pedido + inicia pagamento). */
export function useCheckout() {
  return useMutation({
    mutationFn: (input: CheckoutInput) => lojaApi.checkout(input),
  })
}

/** Lista pedidos do cliente com paginação. */
export function useMeusPedidosLoja(page = 1) {
  return useQuery({
    queryKey: [...MEUS_PEDIDOS_KEY, page],
    queryFn: () => lojaApi.listarMeusPedidos(page),
  })
}

/** Retorna detalhe de um pedido do cliente. Ativa polling enquanto AGUARDANDO_PAGAMENTO. */
export function usePedidoLoja(id: string, pollingAtivo = false) {
  return useQuery({
    queryKey: PEDIDO_LOJA_KEY(id),
    queryFn: () => lojaApi.obterPedido(id),
    // Para o polling automaticamente quando o status sai de AGUARDANDO_PAGAMENTO
    refetchInterval: (query) => {
      if (!pollingAtivo) return false
      const data = query.state.data as { status?: string } | undefined
      return data?.status === 'AGUARDANDO_PAGAMENTO' ? 3000 : false
    },
    enabled: Boolean(id),
  })
}

/** Renova o QR Code PIX de um pedido expirado. */
export function useRenovarPix() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lojaApi.renovarPix(id),
    onSuccess: (_, id) => void qc.invalidateQueries({ queryKey: PEDIDO_LOJA_KEY(id) }),
  })
}

/**
 * Cancela um pedido (cliente):
 * - AGUARDANDO_PAGAMENTO → cancelamento instantâneo
 * - PAGO → solicita cancelamento para aprovação do admin
 */
export function useCancelarPedidoLoja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lojaApi.cancelarPedido(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: PEDIDO_LOJA_KEY(id) })
      void qc.invalidateQueries({ queryKey: MEUS_PEDIDOS_KEY })
    },
  })
}

// ─── Configuração pública (sem auth) ─────────────────────────────────────────

/** Configurações públicas da loja (entrega, pagamento). Usado no checkout. */
export function useConfiguracaoLojaPublica() {
  return useQuery({
    queryKey: CONFIGURACAO_LOJA_PUBLICA_KEY,
    queryFn: () => lojaApi.obterConfiguracaoPublica(),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Admin — Pedidos ──────────────────────────────────────────────────────────

/** Lista todos os pedidos da loja (admin) com filtros e paginação. */
export function useAdminPedidosLoja(params?: ListarPedidosParams) {
  return useQuery({
    queryKey: [...ADMIN_PEDIDOS_LOJA_KEY, params],
    queryFn: () => lojaApi.listarTodosPedidos(params),
  })
}

/** Retorna detalhe de um pedido (admin — acesso irrestrito). */
export function useAdminPedidoLoja(id: string) {
  return useQuery({
    queryKey: ADMIN_PEDIDO_LOJA_KEY(id),
    queryFn: () => lojaApi.obterPedidoAdmin(id),
    enabled: Boolean(id),
  })
}

/** Avança o status de um pedido (admin). */
export function useAtualizarStatusPedidoLoja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      lojaApi.atualizarStatusPedido(id, status),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_LOJA_KEY })
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDO_LOJA_KEY(id) })
    },
  })
}

/** Aprova a solicitação de cancelamento de um pedido (admin) — processa estorno. */
export function useAprovarCancelamentoPedidoLoja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lojaApi.aprovarCancelamentoPedido(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_LOJA_KEY })
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDO_LOJA_KEY(id) })
    },
  })
}

/** Rejeita a solicitação de cancelamento de um pedido (admin). */
export function useRejeitarCancelamentoPedidoLoja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      lojaApi.rejeitarCancelamentoPedido(id, motivo),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_LOJA_KEY })
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDO_LOJA_KEY(id) })
    },
  })
}

// ─── Admin — Clientes ─────────────────────────────────────────────────────────

/** Lista todos os clientes da loja (admin). */
export function useAdminClientes() {
  return useQuery({
    queryKey: ADMIN_CLIENTES_LOJA_KEY,
    queryFn: () => lojaApi.listarClientes(),
  })
}

// ─── Admin — Configuração ─────────────────────────────────────────────────────

/** Retorna configuração completa da loja (admin). */
export function useAdminConfiguracaoLoja() {
  return useQuery({
    queryKey: CONFIGURACAO_LOJA_ADMIN_KEY,
    queryFn: () => lojaApi.obterConfiguracaoAdmin(),
  })
}

/** Atualiza configurações da loja (admin). */
export function useAtualizarConfiguracaoLoja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AtualizarConfiguracaoLojaInput) => lojaApi.atualizarConfiguracao(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CONFIGURACAO_LOJA_ADMIN_KEY })
      void qc.invalidateQueries({ queryKey: CONFIGURACAO_LOJA_PUBLICA_KEY })
    },
  })
}
