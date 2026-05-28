import { MetodoPagamentoMensalidade, StatusMensalidade, TipoMovimentoFinanceiro } from '@apa/shared'

// ─── Mensalidade ─────────────────────────────────────────────────────────────

export interface MensalidadeResponse {
  id: string
  associadoId: string
  competenciaAno: number
  competenciaMes: number
  valor: number
  status: StatusMensalidade
  metodoPagamento?: MetodoPagamentoMensalidade
  dataPagamento?: Date
  motivoIsencao?: string
  criadoEm: Date
  cobrancaGatewayId?: string
  cobrancaLink?: string
  cobrancaStatus?: string
  cobrancaPixCopiaECola?: string
  cobrancaValorCobrado?: number
}

// ─── Emitir Cobrança ─────────────────────────────────────────────────────────

export interface EmitirCobrancaResponse {
  mensalidade: MensalidadeResponse
  linkPagamento: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
}

// ─── Movimento Financeiro ────────────────────────────────────────────────────

export interface MovimentoFinanceiroResponse {
  id: string
  associadoId: string
  campanhaId?: string
  valor: number
  tipo: TipoMovimentoFinanceiro
  descricao?: string
  data: Date
}
