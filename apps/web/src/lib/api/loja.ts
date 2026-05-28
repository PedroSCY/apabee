import { apiFetch } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClienteLojaResponse {
  id: string
  nome: string
  email: string
  telefone?: string
  fotoUrl?: string
  criadoEm: string
}

export interface EnderecoResponse {
  id: string
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  principal: boolean
}

export interface CriarEnderecoInput {
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface AtualizarEnderecoInput extends Partial<CriarEnderecoInput> {}

export interface ItemPedidoLojaResponse {
  id: string
  produtoId: string
  nomeProduto: string
  precoUnitario: number
  quantidade: number
  campanhaCodigo?: string
}

export interface EnderecoEntregaSnapshotResponse {
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface PedidoLojaResponse {
  id: string
  clienteId: string
  status: string
  opcaoEntrega: string
  enderecoEntregaId?: string
  /** Snapshot completo do endereço de entrega (quando houver) */
  enderecoEntrega?: EnderecoEntregaSnapshotResponse
  valorTotal: number
  metodoPagamento?: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  cobrancaExpiracaoEm?: string
  cardInstallments?: number
  observacoes?: string
  criadoEm: string
  itens: ItemPedidoLojaResponse[]
}

export interface CheckoutInput {
  itens: { produtoId: string; quantidade: number }[]
  opcaoEntrega: string
  enderecoEntregaId?: string
  observacoes?: string
  metodoPagamento: 'PIX' | 'CARTAO'
  cardToken?: string
  cardInstallments?: number
  cardPaymentMethodId?: string
  cardIssuerId?: string
}

export interface CheckoutResult {
  pedidoId: string
  status: string
  aprovado: boolean
  valorTotal: number
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  expiracaoEm?: string
  cardInstallments?: number
}

export interface ConfiguracaoLojaPublicaResponse {
  ativaEntregaPrata: boolean
  ativaRetiradaLocal: boolean
  ativaACombinar: boolean
  enderecoRetirada?: string
  horarioAtendimento?: string
  contatoEntrega?: string
  aceitaPix: boolean
  aceitaCartao: boolean
  maxParcelas: number
  minValorParcela: number
}

export interface ConfiguracaoLojaAdminResponse extends ConfiguracaoLojaPublicaResponse {
  ativaCorreios: boolean
  pixExpiracaoMinutos: number
  mensagemConfirmacao?: string
  /** E-mail do responsável que recebe notificações de novos pedidos pagos */
  emailResponsavel?: string
}

export interface AtualizarConfiguracaoLojaInput {
  ativaEntregaPrata?: boolean
  ativaRetiradaLocal?: boolean
  ativaACombinar?: boolean
  ativaCorreios?: boolean
  enderecoRetirada?: string
  horarioAtendimento?: string
  contatoEntrega?: string
  pixExpiracaoMinutos?: number
  mensagemConfirmacao?: string
  aceitaPix?: boolean
  aceitaCartao?: boolean
  maxParcelas?: number
  minValorParcela?: number
  emailResponsavel?: string
}

export interface ListarPedidosParams {
  status?: string
  opcaoEntrega?: string
  clienteEmail?: string
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
}

export interface PaginatedPedidos {
  pedidos: PedidoLojaResponse[]
  total: number
  paginas?: number
}

/** Admin: lista de clientes sem endereços (endereços não são retornados no endpoint de listagem). */
export type ClienteAdminResponse = ClienteLojaResponse

// ─── API ──────────────────────────────────────────────────────────────────────

export const lojaApi = {
  // Auth
  syncCliente: () =>
    apiFetch<{ cliente: ClienteLojaResponse; isNew: boolean }>('/loja/auth/sync', { method: 'POST' }),

  // Configuração pública (sem auth)
  obterConfiguracaoPublica: () =>
    apiFetch<ConfiguracaoLojaPublicaResponse>('/loja/configuracao/publica'),

  // Cliente
  obterCliente: () => apiFetch<ClienteLojaResponse>('/loja/clientes/me'),

  atualizarCliente: (input: { nome?: string; telefone?: string }) =>
    apiFetch<ClienteLojaResponse>('/loja/clientes/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // Endereços
  listarEnderecos: () => apiFetch<EnderecoResponse[]>('/loja/clientes/me/enderecos'),

  criarEndereco: (input: CriarEnderecoInput) =>
    apiFetch<EnderecoResponse>('/loja/clientes/me/enderecos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  atualizarEndereco: (id: string, input: AtualizarEnderecoInput) =>
    apiFetch<EnderecoResponse>(`/loja/clientes/me/enderecos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  removerEndereco: (id: string) =>
    apiFetch<void>(`/loja/clientes/me/enderecos/${id}`, { method: 'DELETE' }),

  definirEnderecoPrincipal: (id: string) =>
    apiFetch<EnderecoResponse>(`/loja/clientes/me/enderecos/${id}/principal`, { method: 'PATCH' }),

  // Pedidos cliente
  checkout: (input: CheckoutInput) =>
    apiFetch<CheckoutResult>('/loja/pedidos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  listarMeusPedidos: (page = 1, limit = 10) =>
    apiFetch<PaginatedPedidos>(`/loja/pedidos/me?page=${page}&limit=${limit}`),

  obterPedido: (id: string) => apiFetch<PedidoLojaResponse>(`/loja/pedidos/me/${id}`),

  renovarPix: (id: string) =>
    apiFetch<CheckoutResult>(`/loja/pedidos/me/${id}/renovar-pix`, { method: 'POST' }),

  cancelarPedido: (id: string) =>
    apiFetch<PedidoLojaResponse>(`/loja/pedidos/me/${id}/cancelar`, { method: 'POST' }),

  // Admin — pedidos
  listarTodosPedidos: (params?: ListarPedidosParams) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.opcaoEntrega) qs.set('opcaoEntrega', params.opcaoEntrega)
    if (params?.clienteEmail) qs.set('clienteEmail', params.clienteEmail)
    if (params?.dataInicio) qs.set('dataInicio', params.dataInicio)
    if (params?.dataFim) qs.set('dataFim', params.dataFim)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    return apiFetch<PaginatedPedidos>(`/loja/admin/pedidos?${qs}`)
  },

  obterPedidoAdmin: (id: string) => apiFetch<PedidoLojaResponse>(`/loja/admin/pedidos/${id}`),

  atualizarStatusPedido: (id: string, status: string) =>
    apiFetch<PedidoLojaResponse>(`/loja/admin/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  aprovarCancelamentoPedido: (id: string) =>
    apiFetch<PedidoLojaResponse>(`/loja/admin/pedidos/${id}/aprovar-cancelamento`, { method: 'POST' }),

  rejeitarCancelamentoPedido: (id: string, motivo?: string) =>
    apiFetch<PedidoLojaResponse>(`/loja/admin/pedidos/${id}/rejeitar-cancelamento`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    }),

  // Admin — clientes
  listarClientes: () => apiFetch<ClienteAdminResponse[]>('/loja/admin/clientes'),

  // Admin — configuração
  obterConfiguracaoAdmin: () =>
    apiFetch<ConfiguracaoLojaAdminResponse>('/loja/admin/configuracao'),

  atualizarConfiguracao: (input: AtualizarConfiguracaoLojaInput) =>
    apiFetch<ConfiguracaoLojaAdminResponse>('/loja/admin/configuracao', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
}
