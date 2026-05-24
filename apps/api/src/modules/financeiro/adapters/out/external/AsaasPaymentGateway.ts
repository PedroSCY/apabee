import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { CobrancaInput, CobrancaResult, IPaymentGateway, StatusCobranca, WebhookEvent } from '@apa/core'

interface AsaasPaymentResponse {
  id: string
  invoiceUrl: string
  pixQrCodeUrl?: string
  pixCopiaECola?: string
  status: string
}

interface AsaasWebhookPayload {
  event: string
  payment?: {
    id: string
    externalReference?: string
    value?: number
    status?: string
  }
  transfer?: {
    id: string
    value?: number
    bankAccount?: {
      bank?: { name?: string }
      agency?: string
      account?: string
    }
    scheduledDate?: string
  }
}

@Injectable()
export class AsaasPaymentGateway implements IPaymentGateway {
  private readonly logger = new Logger(AsaasPaymentGateway.name)
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly webhookToken: string

  constructor(private readonly config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('ASAAS_BASE_URL')
    this.apiKey = config.getOrThrow<string>('ASAAS_API_KEY')
    this.webhookToken = config.getOrThrow<string>('ASAAS_WEBHOOK_TOKEN')
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const body = await response.text()
      this.logger.error(`Asaas API error [${response.status}] ${path}: ${body}`)
      throw new Error(`Asaas API error ${response.status}: ${body}`)
    }

    return response.json() as Promise<T>
  }

  async criarCobranca(input: CobrancaInput): Promise<CobrancaResult> {
    if (!input.cpfCnpjCliente) {
      throw new BadRequestException(
        'Asaas requer CPF/CNPJ do associado. Registre via PATCH /identidade/associados/:id antes de emitir a cobrança.',
      )
    }

    const vencimento = input.vencimento ?? new Date()
    const dueDate = vencimento.toISOString().split('T')[0]

    const body: Record<string, unknown> = {
      customer: await this.obterOuCriarCliente(input),
      billingType: 'PIX',
      value: input.valor,
      dueDate,
      description: input.descricao,
      externalReference: input.referenciaId,
    }

    const payment = await this.fetch<AsaasPaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    // Buscar dados PIX em endpoint separado
    let pixCopiaECola: string | undefined
    try {
      const pix = await this.fetch<{ payload?: string }>(
        `/payments/${payment.id}/pixQrCode`,
      )
      pixCopiaECola = pix.payload
    } catch {
      this.logger.warn(`Não foi possível obter PIX copia-e-cola para ${payment.id}`)
    }

    return {
      gatewayId: payment.id,
      linkPagamento: payment.invoiceUrl,
      pixCopiaECola,
      status: payment.status,
    }
  }

  async consultarStatusCobranca(_gatewayId: string): Promise<StatusCobranca> {
    return 'desconhecido'
  }

  async cancelarCobranca(gatewayId: string): Promise<void> {
    await this.fetch(`/payments/${gatewayId}`, { method: 'DELETE' })
    this.logger.log(`Cobrança ${gatewayId} cancelada no Asaas`)
  }

  async processarWebhook(payload: unknown, token: string): Promise<WebhookEvent> {
    if (token !== this.webhookToken) {
      this.logger.warn('Webhook recebido com token inválido')
      throw new UnauthorizedException('Token de webhook inválido')
    }

    const data = payload as AsaasWebhookPayload

    if ((data.event === 'TRANSFER_PENDING' || data.event === 'TRANSFER_REQUEST') && data.transfer) {
      return {
        tipo: 'SAQUE_SOLICITADO',
        gatewayId: data.transfer.id,
        valor: data.transfer.value,
        saque: {
          id: data.transfer.id,
          valor: data.transfer.value ?? 0,
          bancoNome: data.transfer.bankAccount?.bank?.name,
          agencia: data.transfer.bankAccount?.agency,
          conta: data.transfer.bankAccount?.account,
          dataTransferencia: data.transfer.scheduledDate,
        },
      }
    }

    if (!data.payment) {
      throw new Error(`Evento Asaas desconhecido: ${data.event}`)
    }

    const tipoMap: Record<string, WebhookEvent['tipo']> = {
      PAYMENT_RECEIVED:     'PAGAMENTO_CONFIRMADO',
      PAYMENT_CONFIRMED:    'PAGAMENTO_CONFIRMADO',
      PAYMENT_DELETED:      'PAGAMENTO_CANCELADO',
      PAYMENT_OVERDUE:      'COBRANCA_VENCIDA',
    }

    const tipo = tipoMap[data.event]
    if (!tipo) {
      throw new Error(`Evento Asaas não mapeado: ${data.event}`)
    }

    return {
      tipo,
      gatewayId: data.payment.id,
      referenciaId: data.payment.externalReference,
      valor: data.payment.value,
    }
  }

  private async obterOuCriarCliente(input: CobrancaInput): Promise<string> {
    const search = await this.fetch<{ data: Array<{ id: string }> }>(
      `/customers?email=${encodeURIComponent(input.emailCliente ?? '')}`,
    ).catch(() => ({ data: [] }))

    if (search.data.length > 0 && search.data[0]) return search.data[0].id

    const customer = await this.fetch<{ id: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: input.nomeCliente,
        email: input.emailCliente,
        cpfCnpj: input.cpfCnpjCliente,
      }),
    })
    return customer.id
  }
}
