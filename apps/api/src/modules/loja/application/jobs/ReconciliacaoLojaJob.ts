import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { StatusPedidoLoja } from '@apa/shared'
import type { IPedidoLojaRepository, IPaymentGateway } from '@apa/core'
import { PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { PAYMENT_GATEWAY } from '../../../financeiro/financeiro.tokens'
import { ConfirmarPagamentoPedidoLojaUseCase } from '../use-cases'
import { CONFIRMAR_PAGAMENTO_PEDIDO_LOJA_USE_CASE } from '../../loja.tokens'

/**
 * Job horário que verifica PedidoLoja em AGUARDANDO_PAGAMENTO com mais de 5 min
 * e consulta o gateway para confirmar pagamentos que chegaram sem webhook.
 */
@Injectable()
export class ReconciliacaoLojaJob {
  private readonly logger = new Logger(ReconciliacaoLojaJob.name)

  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    @Inject(CONFIRMAR_PAGAMENTO_PEDIDO_LOJA_USE_CASE)
    private readonly confirmarPagamento: ConfirmarPagamentoPedidoLojaUseCase,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async reconciliar(): Promise<void> {
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000)

    const pendentes = await this.pedidoRepo.findAll({
      status: StatusPedidoLoja.AGUARDANDO_PAGAMENTO,
      dataFim: cincoMinutosAtras,
    })

    const comCobranca = pendentes.pedidos.filter((p) => Boolean(p.cobrancaGatewayId))
    if (comCobranca.length === 0) return

    this.logger.log(`Reconciliação Loja: verificando ${comCobranca.length} pedido(s) pendente(s)`)

    for (const pedido of comCobranca) {
      try {
        const status = await this.gateway.consultarStatusCobranca(pedido.cobrancaGatewayId!)

        if (status === 'pago') {
          await this.confirmarPagamento.execute(pedido.id)
          this.logger.log(`Reconciliação Loja: pedido ${pedido.id} confirmado`)
        } else if (status === 'cancelado') {
          this.logger.warn(
            `Reconciliação Loja: pedido ${pedido.id} com status "${status}" no gateway — admin deve verificar`,
          )
        }
      } catch (err) {
        this.logger.warn(
          `Reconciliação Loja: erro ao reconciliar pedido ${pedido.id}: ${(err as Error).message}`,
        )
      }
    }
  }
}
