import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiExcludeController } from '@nestjs/swagger'
import { Public } from '../../../../../shared/guards'
import { IMensalidadeRepository, IPaymentGateway, IQuitarMensalidadeUseCase } from '@apa/core'
import { MetodoPagamentoMensalidade } from '@apa/shared'
import { MENSALIDADE_REPOSITORY, PAYMENT_GATEWAY, QUITAR_MENSALIDADE_USE_CASE } from '../../../financeiro.tokens'
import { SseService } from '../../../../../shared/sse/sse.service'

/** Recebe eventos dos gateways de pagamento. Excluído do Swagger — endpoints internos (webhook). */
@ApiExcludeController()
@Controller('financeiro/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name)
  private readonly webhookToken: string

  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly gateway: IPaymentGateway,
    @Inject(QUITAR_MENSALIDADE_USE_CASE)
    private readonly quitarMensalidade: IQuitarMensalidadeUseCase,
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    private readonly sse: SseService,
    config: ConfigService,
  ) {
    this.webhookToken = config.getOrThrow<string>('ASAAS_WEBHOOK_TOKEN')
  }

  /**
   * Recebe eventos de pagamento do Asaas (PAYMENT_*, TRANSFER_*).
   * Configurado em: Asaas > Configurações > Webhooks
   */
  @Public()
  @Post('asaas')
  @HttpCode(HttpStatus.OK)
  async handleAsaas(
    @Body() payload: unknown,
    @Headers('asaas-access-token') token: string,
  ): Promise<void> {
    let evento: Awaited<ReturnType<IPaymentGateway['processarWebhook']>>

    try {
      evento = await this.gateway.processarWebhook(payload, token)
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      this.logger.warn(`Webhook Asaas ignorado: ${(err as Error).message}`)
      return
    }

    if (evento.tipo === 'SAQUE_SOLICITADO') {
      this.logger.log(
        `Transferência ${evento.saque?.id} pendente — R$${evento.saque?.valor} para ${evento.saque?.bancoNome ?? 'banco'}`,
      )
      return
    }

    if (evento.tipo === 'PAGAMENTO_CONFIRMADO' && evento.referenciaId) {
      try {
        await this.quitarMensalidade.execute({
          mensalidadeId: evento.referenciaId,
          metodoPagamento: MetodoPagamentoMensalidade.ONLINE,
        })
        this.logger.log(`Mensalidade ${evento.referenciaId} quitada via webhook Asaas`)
      } catch (err) {
        this.logger.warn(`Webhook PAGAMENTO_CONFIRMADO ignorado: ${(err as Error).message}`)
      }
    }

    if (evento.tipo === 'PAGAMENTO_CANCELADO') {
      this.logger.log(`Cobrança ${evento.gatewayId} cancelada no Asaas — sem ação automática`)
    }

    if (evento.tipo === 'COBRANCA_VENCIDA') {
      this.logger.log(`Cobrança ${evento.gatewayId} vencida — associado ${evento.referenciaId ?? 'desconhecido'}`)
    }
  }

  /**
   * Recebe confirmações de pagamento da InfinityPay.
   * URL configurada via env INFINITYPAY_WEBHOOK_URL = {BASE_URL}/financeiro/webhooks/infinitypay
   * Ativo quando PAYMENT_GATEWAY_PROVIDER=infinitypay.
   */
  @Public()
  @Post('infinitypay')
  @HttpCode(HttpStatus.OK)
  async handleInfinityPay(
    @Body() payload: unknown,
  ): Promise<void> {
    let evento: Awaited<ReturnType<IPaymentGateway['processarWebhook']>>

    try {
      evento = await this.gateway.processarWebhook(payload, '')
    } catch (err) {
      this.logger.warn(`Webhook InfinityPay ignorado: ${(err as Error).message}`)
      return
    }

    if (evento.tipo === 'PAGAMENTO_CONFIRMADO' && evento.referenciaId) {
      try {
        await this.quitarMensalidade.execute({
          mensalidadeId: evento.referenciaId,
          metodoPagamento: MetodoPagamentoMensalidade.ONLINE,
        })
        this.logger.log(`Mensalidade ${evento.referenciaId} quitada via webhook InfinityPay`)
      } catch (err) {
        this.logger.warn(`Webhook InfinityPay PAGAMENTO_CONFIRMADO ignorado: ${(err as Error).message}`)
      }
    }
  }

  /**
   * Recebe notificações de pagamento do Mercado Pago.
   * URL configurada via env MERCADOPAGO_WEBHOOK_URL = {BASE_URL}/financeiro/webhooks/mercadopago
   * Ativo quando PAYMENT_GATEWAY_PROVIDER=mercadopago (padrão).
   */
  @Public()
  @Post('mercadopago')
  @HttpCode(HttpStatus.OK)
  async handleMercadoPago(
    @Body() payload: unknown,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
  ): Promise<void> {
    const token = JSON.stringify({ xSignature, xRequestId })

    let evento: Awaited<ReturnType<IPaymentGateway['processarWebhook']>>

    try {
      evento = await this.gateway.processarWebhook(payload, token)
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      this.logger.warn(`Webhook Mercado Pago ignorado: ${(err as Error).message}`)
      return
    }

    if (evento.tipo === 'PAGAMENTO_CONFIRMADO') {
      await this.quitarPorReferencia(evento.referenciaId, evento.gatewayId, 'Mercado Pago')
    }

    if (evento.tipo === 'PAGAMENTO_CANCELADO') {
      this.logger.log(`Cobrança ${evento.gatewayId} cancelada no MP — sem ação automática`)
    }

    if (evento.tipo === 'COBRANCA_VENCIDA') {
      this.logger.log(`Cobrança ${evento.gatewayId} expirada no MP`)
    }
  }

  private async quitarPorReferencia(
    referenciaId: string | undefined,
    gatewayId: string,
    origem: string,
  ): Promise<void> {
    let mensalidadeId = referenciaId

    if (!mensalidadeId || mensalidadeId === gatewayId) {
      const mensalidade = await this.mensalidadeRepo.findByCobrancaGatewayId(gatewayId)
      if (!mensalidade) {
        this.logger.warn(`Webhook ${origem}: mensalidade não encontrada para gatewayId=${gatewayId}`)
        return
      }
      mensalidadeId = mensalidade.id
    }

    try {
      await this.quitarMensalidade.execute({
        mensalidadeId,
        metodoPagamento: MetodoPagamentoMensalidade.ONLINE,
      })
      this.logger.log(`Mensalidade ${mensalidadeId} quitada via webhook ${origem}`)
      this.sse.emit('financeiro:mensalidade-quitada', mensalidadeId)
    } catch (err) {
      this.logger.warn(`Webhook ${origem} PAGAMENTO_CONFIRMADO ignorado: ${(err as Error).message}`)
    }
  }

  /**
   * Endpoint dedicado para o mecanismo de validação de saque do Asaas.
   * Configurado em: Asaas > Integrações > Mecanismos de Segurança
   * Asaas aguarda resposta síncrona em até 5 segundos.
   * Timeout ou 3 falhas → saque cancelado automaticamente pelo Asaas.
   */
  @Public()
  @Post('asaas/validacao-saque')
  @HttpCode(HttpStatus.OK)
  async handleAsaasValidacaoSaque(
    @Body() _payload: unknown,
    @Headers('asaas-access-token') token: string,
  ): Promise<{ status: string; refuseReason?: string }> {
    if (token !== this.webhookToken) {
      this.logger.warn('Validação de saque recebida com token inválido')
      throw new UnauthorizedException('Token de webhook inválido')
    }

    const hora = new Date().getHours()
    if (hora < 8 || hora >= 18) {
      this.logger.warn('Saque recusado — fora do horário comercial')
      return { status: 'REFUSED', refuseReason: 'Saques permitidos apenas entre 08h e 18h' }
    }

    this.logger.log('Saque aprovado automaticamente')
    return { status: 'APPROVED' }
  }
}
