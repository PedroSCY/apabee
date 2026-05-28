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
import { ApiExcludeController } from '@nestjs/swagger'
import { Public } from '../../../../../shared/guards'
import { IPaymentGateway, IPedidoLojaRepository } from '@apa/core'
import { PAYMENT_GATEWAY } from '../../../../financeiro/financeiro.tokens'
import {
  PEDIDO_LOJA_REPOSITORY,
  CONFIRMAR_PAGAMENTO_PEDIDO_LOJA_USE_CASE,
} from '../../../loja.tokens'
import { ConfirmarPagamentoPedidoLojaUseCase } from '../../../application/use-cases'

@ApiExcludeController()
@Controller('loja/webhooks')
export class WebhookLojaController {
  private readonly logger = new Logger(WebhookLojaController.name)

  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(CONFIRMAR_PAGAMENTO_PEDIDO_LOJA_USE_CASE)
    private readonly confirmarPagamento: ConfirmarPagamentoPedidoLojaUseCase,
  ) {}

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
      this.logger.warn(`Webhook Loja MP ignorado: ${(err as Error).message}`)
      return
    }

    if (evento.tipo !== 'PAGAMENTO_CONFIRMADO') return

    let pedidoId = evento.referenciaId

    if (!pedidoId || pedidoId === evento.gatewayId) {
      const pedido = await this.pedidoRepo.findByCobrancaGatewayId(evento.gatewayId)
      if (!pedido) {
        this.logger.warn(`Webhook Loja: pedido não encontrado para gatewayId=${evento.gatewayId}`)
        return
      }
      pedidoId = pedido.id
    }

    try {
      await this.confirmarPagamento.execute(pedidoId)
      this.logger.log(`PedidoLoja ${pedidoId} confirmado via webhook MP`)
    } catch (err) {
      this.logger.warn(`Webhook Loja: erro ao confirmar ${pedidoId}: ${(err as Error).message}`)
    }
  }
}
