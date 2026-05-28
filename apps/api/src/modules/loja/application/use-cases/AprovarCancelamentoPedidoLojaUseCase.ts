import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { IClienteRepository, IPedidoLojaRepository, PedidoLoja } from '@apa/core'
import { StatusPedidoLoja, MetodoPagamentoPedidoLoja } from '@apa/shared'
import { CLIENTE_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { PAYMENT_GATEWAY } from '../../../financeiro/financeiro.tokens'
import { IPaymentGateway } from '@apa/core'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://apabee.vercel.app'
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

@Injectable()
export class AprovarCancelamentoPedidoLojaUseCase {
  private readonly logger = new Logger(AprovarCancelamentoPedidoLojaUseCase.name)

  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    private readonly notificacao: NotificacaoService,
  ) {}

  async execute(pedidoId: string): Promise<PedidoLoja> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException('Pedido não encontrado.')

    if (pedido.status !== StatusPedidoLoja.CANCELAMENTO_SOLICITADO) {
      throw new BadRequestException('O pedido não possui solicitação de cancelamento pendente.')
    }

    // 1. Processa o estorno no gateway de pagamento (se houver cobrança paga)
    if (pedido.cobrancaGatewayId) {
      try {
        await this.gateway.estornarCobranca(pedido.cobrancaGatewayId)
        this.logger.log(`Estorno processado para pedido ${pedidoId} — gateway: ${pedido.cobrancaGatewayId}`)
      } catch (err) {
        this.logger.error(`Erro ao processar estorno pedido ${pedidoId}: ${(err as Error).message}`)
        // Não interrompe o cancelamento: o admin pode processar estorno manualmente
      }
    }

    // 2. Cancela o pedido no domínio
    let cancelado: PedidoLoja
    try {
      cancelado = pedido.cancelar()
    } catch (err: unknown) {
      throw new BadRequestException(err instanceof Error ? err.message : 'Erro ao cancelar pedido.')
    }

    const resultado = await this.pedidoRepo.update(cancelado)

    // 3. E-mail ao cliente com prazo de estorno
    try {
      const cliente = await this.clienteRepo.findById(pedido.clienteId)
      if (cliente) {
        const prazoEstorno = pedido.metodoPagamento === MetodoPagamentoPedidoLoja.CARTAO
          ? 'O valor será devolvido na fatura do cartão em até <strong>10-20 dias úteis</strong>, conforme política da operadora.'
          : 'O valor será devolvido via PIX em instantes.'

        void this.notificacao.enviarEmailDireto(
          cliente.email,
          'Cancelamento aprovado — estorno em processamento',
          `Sua solicitação de cancelamento do pedido <strong>#${pedidoId.slice(0, 8)}</strong> (${fmt(pedido.valorTotal)}) foi aprovada.<br><br>
${prazoEstorno}<br><br>
Se tiver dúvidas, entre em contato conosco. Acesse <a href="${FRONTEND_URL}/minha-conta/pedidos/${pedidoId}">Minha Conta</a> para verificar os detalhes.`,
        )
      }
    } catch (err) {
      this.logger.error(`Erro ao enviar e-mail aprovação cancelamento pedido ${pedidoId}: ${(err as Error).message}`)
    }

    return resultado
  }
}
