import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { CobrancaInput, CobrancaResult, IPaymentGateway, StatusCobranca, WebhookEvent } from '@apa/core'

interface InfinityPayLinkResponse {
  url: string
}

interface InfinityPayPaymentCheckResponse {
  success: boolean
  paid: boolean
  amount: number
  paid_amount: number
  installments: number
  capture_method: 'credit_card' | 'pix'
}

interface InfinityPayWebhookPayload {
  invoice_slug: string
  order_nsu: string
  amount: number
  paid_amount: number
  capture_method: string
  transaction_nsu: string
  receipt_url?: string
}

@Injectable()
export class InfinityPayCheckoutGateway implements IPaymentGateway {
  private readonly logger = new Logger(InfinityPayCheckoutGateway.name)
  private readonly baseUrl = 'https://api.checkout.infinitepay.io'
  private readonly handle: string
  private readonly webhookUrl: string

  constructor(config: ConfigService) {
    this.handle = config.getOrThrow<string>('INFINITYPAY_HANDLE')
    this.webhookUrl = config.getOrThrow<string>('INFINITYPAY_WEBHOOK_URL')
  }

  async criarCobranca(input: CobrancaInput): Promise<CobrancaResult> {
    if (input.valor < 1) {
      throw new BadRequestException(
        `InfinityPay exige valor mínimo de R$ 1,00. Valor da mensalidade: R$ ${input.valor.toFixed(2).replace('.', ',')}`,
      )
    }

    const body = {
      handle: this.handle,
      order_nsu: input.referenciaId,
      webhook_url: this.webhookUrl,
      items: [
        {
          quantity: 1,
          price: Math.round(input.valor * 100),
          description: input.descricao,
        },
      ],
      ...(input.nomeCliente || input.emailCliente
        ? { customer: { name: input.nomeCliente, email: input.emailCliente } }
        : {}),
    }

    const response = await this.post<InfinityPayLinkResponse>('/links', body)

    this.logger.log(`Cobrança InfinityPay criada: order_nsu=${input.referenciaId} link=${response.url}`)

    return {
      gatewayId: input.referenciaId,
      linkPagamento: response.url,
      pixCopiaECola: undefined,
      status: 'PENDING',
    }
  }

  async consultarStatusCobranca(_gatewayId: string): Promise<StatusCobranca> {
    return 'desconhecido'
  }

  async cancelarCobranca(gatewayId: string): Promise<void> {
    // InfinityPay não possui endpoint de cancelamento de links via API.
    // Cancele manualmente no app: "Seu negócio" → "Suas vendas" → "Cancelar venda".
    this.logger.warn(
      `cancelarCobranca: InfinityPay não suporta cancelamento via API (order_nsu=${gatewayId}). ` +
        `Cancele manualmente no app InfinityPay se necessário.`,
    )
  }

  async processarWebhook(payload: unknown, _token: string): Promise<WebhookEvent> {
    const data = payload as Partial<InfinityPayWebhookPayload>

    if (!data.order_nsu) {
      throw new Error('Payload InfinityPay inválido: order_nsu ausente')
    }

    // Validação ativa: confirma com a InfinityPay que o pagamento está pago
    // (substitui validação por token, que a InfinityPay não suporta)
    const confirmacao = await this.verificarPagamento(data.order_nsu, data.invoice_slug)

    if (!confirmacao.success || !confirmacao.paid) {
      throw new Error(
        `Webhook InfinityPay não confirmado pelo payment_check: paid=${confirmacao.paid}`,
      )
    }

    this.logger.log(
      `Pagamento InfinityPay confirmado via payment_check: order_nsu=${data.order_nsu} ` +
        `método=${data.capture_method} valor=R$${(confirmacao.paid_amount / 100).toFixed(2)}`,
    )

    return {
      tipo: 'PAGAMENTO_CONFIRMADO',
      gatewayId: data.order_nsu,
      referenciaId: data.order_nsu,
      valor: confirmacao.paid_amount / 100,
    }
  }

  private async verificarPagamento(
    orderNsu: string,
    slug?: string,
  ): Promise<InfinityPayPaymentCheckResponse> {
    return this.post<InfinityPayPaymentCheckResponse>('/payment_check', {
      handle: this.handle,
      order_nsu: orderNsu,
      ...(slug ? { slug } : {}),
    })
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      this.logger.error(`InfinityPay API error [${response.status}] ${path}: ${text}`)
      throw new Error(`InfinityPay API error ${response.status}: ${text}`)
    }

    return response.json() as Promise<T>
  }
}
