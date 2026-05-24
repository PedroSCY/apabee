import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { MetodoPagamentoMensalidade, StatusMensalidade } from '@apa/shared'
import type { IMensalidadeRepository, IPaymentGateway, IQuitarMensalidadeUseCase } from '@apa/core'
import {
  MENSALIDADE_REPOSITORY,
  PAYMENT_GATEWAY,
  QUITAR_MENSALIDADE_USE_CASE,
} from '../../financeiro.tokens'

/**
 * Job que roda a cada hora e verifica cobranças PENDENTE no gateway.
 * Garante que mensalidades pagas durante downtime da API sejam quitadas
 * mesmo sem receber o webhook de confirmação.
 */
@Injectable()
export class ReconciliacaoWebhookJob {
  private readonly logger = new Logger(ReconciliacaoWebhookJob.name)

  constructor(
    @Inject(MENSALIDADE_REPOSITORY) private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    @Inject(QUITAR_MENSALIDADE_USE_CASE) private readonly quitarMensalidade: IQuitarMensalidadeUseCase,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async reconciliar(): Promise<void> {
    const pendentes = await this.mensalidadeRepo.findByStatus(StatusMensalidade.PENDENTE)
    const comCobranca = pendentes.filter((m) => Boolean(m.cobrancaGatewayId))

    if (comCobranca.length === 0) return

    this.logger.log(`Reconciliação: verificando ${comCobranca.length} cobrança(s) pendente(s) no gateway`)

    for (const mensalidade of comCobranca) {
      try {
        const status = await this.gateway.consultarStatusCobranca(mensalidade.cobrancaGatewayId!)

        if (status === 'pago') {
          await this.quitarMensalidade.execute({
            mensalidadeId: mensalidade.id,
            metodoPagamento: MetodoPagamentoMensalidade.ONLINE,
          })
          this.logger.log(`Reconciliação: mensalidade ${mensalidade.id} quitada (gatewayId=${mensalidade.cobrancaGatewayId})`)
        }
      } catch (err) {
        this.logger.warn(
          `Reconciliação: erro ao consultar gatewayId=${mensalidade.cobrancaGatewayId}: ${(err as Error).message}`,
        )
      }
    }
  }
}
