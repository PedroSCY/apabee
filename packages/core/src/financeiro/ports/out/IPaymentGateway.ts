export interface CobrancaInput {
  referenciaId: string
  valor: number
  descricao: string
  nomeCliente: string
  emailCliente?: string
  cpfCnpjCliente?: string
  vencimento?: Date
  metadata?: Record<string, string>
  /** Método de pagamento. Padrão: 'PIX' (preserva comportamento existente). */
  metodoPagamento?: 'PIX' | 'CARTAO'
  /** Token gerado pelo MP SDK no client — obrigatório quando metodoPagamento = 'CARTAO'. */
  cardToken?: string
  cardInstallments?: number
  /** Ex: 'visa', 'master', 'amex'. */
  cardPaymentMethodId?: string
  cardIssuerId?: string
}

export interface CobrancaResult {
  gatewayId: string
  linkPagamento: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  /** 'pending' | 'approved' | 'rejected' | 'in_process' */
  status: string
  /** Valor efetivamente cobrado do associado (já inclui repasse de taxa do gateway). */
  valorCobrado?: number
  /** Motivo de rejeição traduzido para o usuário (somente quando status = 'rejected'). */
  motivoRejeicao?: string
}

export type TipoEventoWebhook =
  | 'PAGAMENTO_CONFIRMADO'
  | 'PAGAMENTO_CANCELADO'
  | 'COBRANCA_VENCIDA'
  | 'SAQUE_SOLICITADO'

export interface WebhookEvent {
  tipo: TipoEventoWebhook
  referenciaId?: string
  gatewayId: string
  valor?: number
  // Presente apenas quando tipo === 'SAQUE_SOLICITADO'
  saque?: {
    id: string
    valor: number
    bancoNome?: string
    agencia?: string
    conta?: string
    dataTransferencia?: string
  }
}

export type StatusCobranca = 'pago' | 'cancelado' | 'pendente' | 'desconhecido'

export interface IPaymentGateway {
  /** Cria uma cobrança PIX/boleto no gateway e retorna o link de pagamento. */
  criarCobranca(input: CobrancaInput): Promise<CobrancaResult>

  /** Cancela uma cobrança ativa no gateway (PIX pendente). */
  cancelarCobranca(gatewayId: string): Promise<void>

  /**
   * Estorna (reembolsa) uma cobrança já aprovada.
   * Funciona para PIX (estorno imediato) e cartão (prazo de 10-20 dias úteis).
   */
  estornarCobranca(gatewayId: string): Promise<void>

  /** Consulta o status atual de uma cobrança — usado pela reconciliação de webhooks perdidos. */
  consultarStatusCobranca(gatewayId: string): Promise<StatusCobranca>

  /**
   * Valida e interpreta um payload de webhook de eventos (pagamentos, transferências).
   * Lança UnauthorizedException se o token for inválido.
   */
  processarWebhook(payload: unknown, token: string): Promise<WebhookEvent>
}
