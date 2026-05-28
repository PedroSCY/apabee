import { createHmac } from 'crypto'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { CobrancaInput, CobrancaResult, IPaymentGateway, StatusCobranca, WebhookEvent } from '@apa/core'

const MAPA_REJEICAO: Record<string, string> = {
  cc_rejected_insufficient_amount: 'Saldo insuficiente',
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido',
  cc_rejected_bad_filled_security_code: 'Código de segurança inválido',
  cc_rejected_bad_filled_date: 'Validade do cartão inválida',
  cc_rejected_call_for_authorize: 'Contate seu banco para autorizar',
  cc_rejected_card_disabled: 'Cartão bloqueado',
  cc_rejected_high_risk: 'Pagamento recusado por segurança',
  cc_rejected_duplicated_payment: 'Pagamento duplicado',
  cc_rejected_max_attempts: 'Número máximo de tentativas atingido',
  cc_rejected_other_reason: 'Pagamento recusado pelo banco',
}

interface MpPaymentResponse {
  id: number
  status: string
  status_detail?: string
  external_reference?: string
  transaction_amount?: number
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
      ticket_url?: string
    }
  }
}

interface MpWebhookPayload {
  type?: string
  action?: string
  data?: { id?: string }
}

@Injectable()
export class MercadoPagoGateway implements IPaymentGateway {
  private readonly logger = new Logger(MercadoPagoGateway.name)
  private readonly baseUrl = 'https://api.mercadopago.com'
  private readonly accessToken: string
  private readonly webhookSecret: string
  private readonly feePercent: number

  constructor(config: ConfigService) {
    this.accessToken = config.getOrThrow<string>('MERCADOPAGO_ACCESS_TOKEN')
    this.webhookSecret = config.get<string>('MERCADOPAGO_WEBHOOK_SECRET') ?? ''
    this.feePercent = config.get<number>('MERCADOPAGO_FEE_PERCENT') ?? 0
  }

  async criarCobranca(input: CobrancaInput): Promise<CobrancaResult> {
    const [firstName, ...rest] = (input.nomeCliente ?? 'Cliente').split(' ')
    const lastName = rest.join(' ') || firstName

    const payer: Record<string, unknown> = {
      email: input.emailCliente ?? 'pagador@apabee.com.br',
      first_name: firstName,
      last_name: lastName,
      ...(input.cpfCnpjCliente
        ? { identification: { type: 'CPF', number: input.cpfCnpjCliente.replace(/\D/g, '') } }
        : {}),
    }

    if (input.metodoPagamento === 'CARTAO') {
      return this.criarCobrancaCartao(input, payer)
    }

    return this.criarCobrancaPix(input, payer)
  }

  private async criarCobrancaPix(
    input: CobrancaInput,
    payer: Record<string, unknown>,
  ): Promise<CobrancaResult> {
    const vencimento = input.vencimento ?? new Date(Date.now() + 24 * 60 * 60 * 1000)

    const valorCobrado = this.feePercent > 0
      ? Math.ceil((input.valor / (1 - this.feePercent / 100)) * 100) / 100
      : input.valor

    const body: Record<string, unknown> = {
      transaction_amount: valorCobrado,
      description: input.descricao,
      payment_method_id: 'pix',
      external_reference: input.referenciaId,
      date_of_expiration: vencimento.toISOString(),
      payer,
    }

    const res = await this.request<MpPaymentResponse>('POST', '/v1/payments', body, {
      'X-Idempotency-Key': input.referenciaId,
    })

    const txData = res.point_of_interaction?.transaction_data
    const ticketUrl = txData?.ticket_url ?? ''
    const pixCopiaECola = txData?.qr_code
    const pixQrCodeBase64 = txData?.qr_code_base64

    this.logger.log(`Cobrança PIX MP criada: id=${res.id} referencia=${input.referenciaId} valorCobrado=${valorCobrado}`)

    return {
      gatewayId: String(res.id),
      linkPagamento: ticketUrl,
      pixCopiaECola,
      pixQrCodeBase64,
      status: res.status ?? 'pending',
      valorCobrado: valorCobrado !== input.valor ? valorCobrado : undefined,
    }
  }

  private async criarCobrancaCartao(
    input: CobrancaInput,
    payer: Record<string, unknown>,
  ): Promise<CobrancaResult> {
    const body: Record<string, unknown> = {
      transaction_amount: input.valor,
      description: input.descricao,
      external_reference: input.referenciaId,
      token: input.cardToken,
      installments: input.cardInstallments ?? 1,
      payment_method_id: input.cardPaymentMethodId,
      issuer_id: input.cardIssuerId,
      payer,
    }

    const res = await this.request<MpPaymentResponse>('POST', '/v1/payments', body, {
      'X-Idempotency-Key': input.referenciaId,
    })

    this.logger.log(`Cobrança Cartão MP: id=${res.id} status=${res.status} detail=${res.status_detail}`)

    const motivoRejeicao = res.status === 'rejected'
      ? (MAPA_REJEICAO[res.status_detail ?? ''] ?? 'Pagamento recusado')
      : undefined

    return {
      gatewayId: String(res.id),
      linkPagamento: '',
      status: res.status ?? 'rejected',
      valorCobrado: res.transaction_amount,
      motivoRejeicao,
    }
  }

  async consultarStatusCobranca(gatewayId: string): Promise<StatusCobranca> {
    const pagamento = await this.request<MpPaymentResponse>('GET', `/v1/payments/${gatewayId}`)
    if (pagamento.status === 'approved') return 'pago'
    if (['cancelled', 'refunded', 'charged_back'].includes(pagamento.status ?? '')) return 'cancelado'
    if (pagamento.status === 'pending' || pagamento.status === 'in_process') return 'pendente'
    return 'desconhecido'
  }

  async cancelarCobranca(gatewayId: string): Promise<void> {
    const pagamento = await this.request<MpPaymentResponse>('GET', `/v1/payments/${gatewayId}`)

    const jaEncerrado = ['cancelled', 'refunded', 'charged_back'].includes(pagamento.status ?? '')
    if (jaEncerrado) {
      this.logger.log(`Cobrança MP já encerrada (${pagamento.status}): id=${gatewayId} — nenhuma ação`)
      return
    }

    if (pagamento.status === 'approved') {
      await this.request('POST', `/v1/payments/${gatewayId}/refunds`, {})
      this.logger.log(`Cobrança MP reembolsada: id=${gatewayId}`)
    } else {
      await this.request('PUT', `/v1/payments/${gatewayId}`, { status: 'cancelled' })
      this.logger.log(`Cobrança MP cancelada: id=${gatewayId}`)
    }
  }

  async estornarCobranca(gatewayId: string): Promise<void> {
    const pagamento = await this.request<MpPaymentResponse>('GET', `/v1/payments/${gatewayId}`)

    if (['refunded', 'charged_back'].includes(pagamento.status ?? '')) {
      this.logger.log(`Cobrança MP já estornada (${pagamento.status}): id=${gatewayId} — nenhuma ação`)
      return
    }

    if (pagamento.status !== 'approved') {
      throw new Error(`Não é possível estornar pagamento com status "${pagamento.status}". Somente pagamentos aprovados podem ser estornados.`)
    }

    await this.request('POST', `/v1/payments/${gatewayId}/refunds`, {})
    this.logger.log(`Estorno MP solicitado com sucesso: id=${gatewayId}`)
  }

  async processarWebhook(payload: unknown, token: string): Promise<WebhookEvent> {
    const data = payload as MpWebhookPayload

    if (!data?.data?.id) {
      throw new Error('Payload Mercado Pago inválido: data.id ausente')
    }

    // Verificação de assinatura HMAC-SHA256 (quando configurada)
    if (this.webhookSecret && token) {
      this.verificarAssinatura(data, token)
    }

    if (data.type !== 'payment') {
      throw new Error(`Tipo de evento não suportado: ${data.type}`)
    }

    // Busca o pagamento para obter o status atual
    const pagamento = await this.request<MpPaymentResponse>('GET', `/v1/payments/${data.data.id}`)

    this.logger.log(`Webhook MP: id=${pagamento.id} status=${pagamento.status} action=${data.action}`)

    if (pagamento.status === 'approved') {
      return {
        tipo: 'PAGAMENTO_CONFIRMADO',
        gatewayId: String(pagamento.id),
        referenciaId: pagamento.external_reference ?? String(pagamento.id),
        valor: undefined,
      }
    }

    if (pagamento.status === 'cancelled') {
      return { tipo: 'PAGAMENTO_CANCELADO', gatewayId: String(pagamento.id) }
    }

    if (pagamento.status === 'expired') {
      return { tipo: 'COBRANCA_VENCIDA', gatewayId: String(pagamento.id) }
    }

    throw new Error(`Status do pagamento não tratado: ${pagamento.status}`)
  }

  private verificarAssinatura(payload: MpWebhookPayload, token: string): void {
    // token = JSON.stringify({ xSignature, xRequestId }) enviado pelo WebhooksController
    let xSignature = token
    let xRequestId = ''

    try {
      const parsed = JSON.parse(token) as { xSignature?: string; xRequestId?: string }
      xSignature = parsed.xSignature ?? token
      xRequestId = parsed.xRequestId ?? ''
    } catch {
      // token veio como string simples — usa diretamente como x-signature
    }

    const match = xSignature.match(/ts=([^,]+),v1=([^\s]+)/)
    if (!match) throw new UnauthorizedException('Formato de assinatura Mercado Pago inválido.')

    const [, ts, v1] = match
    const partes: string[] = []
    if (payload.data?.id) partes.push(`id:${payload.data.id}`)
    if (xRequestId) partes.push(`request-id:${xRequestId}`)
    partes.push(`ts:${ts}`)
    const manifest = partes.join(';') + ';'

    const hash = createHmac('sha256', this.webhookSecret).update(manifest).digest('hex')

    if (hash !== v1) {
      throw new UnauthorizedException('Assinatura de webhook Mercado Pago inválida.')
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text()
      this.logger.error(`Mercado Pago API error [${res.status}] ${method} ${path}: ${text}`)
      throw new Error(`Mercado Pago API error ${res.status}: ${text}`)
    }

    return res.json() as Promise<T>
  }
}
