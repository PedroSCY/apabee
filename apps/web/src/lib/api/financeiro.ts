import { apiFetch } from './client'

export type TipoMovimento = 'ANTECIPACAO' | 'RATEIO_FINAL' | 'CUSTO' | 'MENSALIDADE'

export interface MovimentoFinanceiroResponse {
  id: string
  associadoId: string
  campanhaId?: string
  valor: number
  tipo: TipoMovimento
  descricao?: string
  data: string
}

export type StatusMensalidade = 'PENDENTE' | 'PAGO' | 'ISENTO'
export type MetodoPagamentoMensalidade = 'PRESENCIAL' | 'TRANSFERENCIA' | 'ONLINE'

export interface MensalidadeResponse {
  id: string
  associadoId: string
  competenciaAno: number
  competenciaMes: number
  valor: number
  status: StatusMensalidade
  metodoPagamento?: MetodoPagamentoMensalidade
  dataPagamento?: string
  motivoIsencao?: string
  criadoEm: string
  cobrancaGatewayId?: string
  cobrancaLink?: string
  cobrancaStatus?: string
  cobrancaPixCopiaECola?: string
  cobrancaValorCobrado?: number
}

export interface EmitirCobrancaResponse {
  mensalidade: MensalidadeResponse
  linkPagamento: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  valorCobrado?: number
}

export interface GerarMensalidadesInput {
  competenciaAno: number
  competenciaMes: number
  valorPadrao?: number
}

export interface QuitarMensalidadeInput {
  metodoPagamento: 'PRESENCIAL' | 'TRANSFERENCIA'
}

export interface MarcarIsentoInput {
  motivo?: string
}

export const financeiroApi = {
  /** Lista todos os movimentos financeiros (admin). */
  listarMovimentos: (params?: { associadoId?: string; campanhaId?: string; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.associadoId) qs.set('associadoId', params.associadoId)
    if (params?.campanhaId) qs.set('campanhaId', params.campanhaId)
    if (params?.limit) qs.set('limit', String(params.limit))
    return apiFetch<MovimentoFinanceiroResponse[]>(`/financeiro/movimentos?${qs.toString()}`)
  },

  /** Lista movimentos financeiros de um associado (legacy — use listarMovimentos com filtro). */
  listarMovimentosPorAssociado: (associadoId: string) =>
    apiFetch<MovimentoFinanceiroResponse[]>(
      `/financeiro/movimentos?associadoId=${associadoId}`,
    ),

  // ── Rotas do associado logado (/me) ──────────────────────────────────────

  /** Retorna as mensalidades do associado logado. */
  minhasMensalidades: () =>
    apiFetch<MensalidadeResponse[]>('/financeiro/me/mensalidades'),

  /** Emite cobrança PIX para uma mensalidade do associado logado. */
  solicitarPix: (id: string) =>
    apiFetch<EmitirCobrancaResponse>(`/financeiro/me/mensalidades/${id}/solicitar-pix`, {
      method: 'POST',
    }),

  /** Retorna os movimentos financeiros do associado logado. */
  meusMovimentos: () =>
    apiFetch<MovimentoFinanceiroResponse[]>('/financeiro/me/movimentos'),

  /** Gera mensalidades para todos os associados ativos de uma competência. */
  gerarMensalidades: (input: GerarMensalidadesInput) =>
    apiFetch<MensalidadeResponse[]>('/financeiro/mensalidades/gerar', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Lista mensalidades de uma competência (admin). */
  listarMensalidades: (params: { ano?: number; mes?: number; status?: StatusMensalidade }) => {
    const qs = new URLSearchParams()
    if (params.ano) qs.set('ano', String(params.ano))
    if (params.mes) qs.set('mes', String(params.mes))
    if (params.status) qs.set('status', params.status)
    return apiFetch<MensalidadeResponse[]>(`/financeiro/mensalidades?${qs.toString()}`)
  },

  /** Lista mensalidades de um associado específico. */
  listarMensalidadesPorAssociado: (associadoId: string) =>
    apiFetch<MensalidadeResponse[]>(`/financeiro/mensalidades/associado/${associadoId}`),

  /** Quita uma mensalidade manualmente. */
  quitarMensalidade: (id: string, input: QuitarMensalidadeInput) =>
    apiFetch<MensalidadeResponse>(`/financeiro/mensalidades/${id}/quitar`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Marca uma mensalidade como isenta. */
  marcarIsentoMensalidade: (id: string, input: MarcarIsentoInput) =>
    apiFetch<MensalidadeResponse>(`/financeiro/mensalidades/${id}/isentar`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Reativa uma mensalidade isenta para PENDENTE. */
  reativarMensalidade: (id: string) =>
    apiFetch<MensalidadeResponse>(`/financeiro/mensalidades/${id}/reativar`, {
      method: 'PATCH',
    }),

  /** Emite cobrança PIX no gateway para uma mensalidade PENDENTE. */
  emitirCobranca: (id: string) =>
    apiFetch<EmitirCobrancaResponse>(`/financeiro/mensalidades/${id}/emitir-cobranca`, {
      method: 'POST',
    }),

  /** Cancela a cobrança ativa no gateway (sem cancelar a mensalidade). */
  cancelarCobranca: (id: string) =>
    apiFetch<MensalidadeResponse>(`/financeiro/mensalidades/${id}/cobranca`, {
      method: 'DELETE',
    }),

  /** Estorna uma mensalidade PAGO, revertendo para PENDENTE. */
  estornarMensalidade: (id: string) =>
    apiFetch<MensalidadeResponse>(`/financeiro/mensalidades/${id}/estornar`, {
      method: 'POST',
    }),

  /** Exclui uma mensalidade PENDENTE sem cobrança ativa (permite regerar no mesmo mês). */
  excluirMensalidade: (id: string) =>
    apiFetch<void>(`/financeiro/mensalidades/${id}`, { method: 'DELETE' }),
}
