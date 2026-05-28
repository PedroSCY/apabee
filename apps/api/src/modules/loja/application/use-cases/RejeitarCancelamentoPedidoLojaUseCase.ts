import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { IClienteRepository, IPedidoLojaRepository, PedidoLoja } from '@apa/core'
import { StatusPedidoLoja } from '@apa/shared'
import { CLIENTE_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://apabee.vercel.app'
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

@Injectable()
export class RejeitarCancelamentoPedidoLojaUseCase {
  private readonly logger = new Logger(RejeitarCancelamentoPedidoLojaUseCase.name)

  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    private readonly notificacao: NotificacaoService,
  ) {}

  async execute(pedidoId: string, motivo?: string): Promise<PedidoLoja> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException('Pedido não encontrado.')

    if (pedido.status !== StatusPedidoLoja.CANCELAMENTO_SOLICITADO) {
      throw new BadRequestException('O pedido não possui solicitação de cancelamento pendente.')
    }

    let rejeitado: PedidoLoja
    try {
      rejeitado = pedido.rejeitarCancelamento()
    } catch (err: unknown) {
      throw new BadRequestException(err instanceof Error ? err.message : 'Erro ao rejeitar cancelamento.')
    }

    const resultado = await this.pedidoRepo.update(rejeitado)

    // E-mail ao cliente informando rejeição
    try {
      const cliente = await this.clienteRepo.findById(pedido.clienteId)
      if (cliente) {
        void this.notificacao.enviarEmailDireto(
          cliente.email,
          'Solicitação de cancelamento não aprovada',
          `Sua solicitação de cancelamento do pedido <strong>#${pedidoId.slice(0, 8)}</strong> (${fmt(pedido.valorTotal)}) não pôde ser aprovada no momento.${
            motivo ? `<br><br><strong>Motivo:</strong> ${motivo}` : ''
          }<br><br>
Seu pedido voltará ao fluxo normal. Em caso de dúvidas, entre em contato conosco.<br>
Acesse <a href="${FRONTEND_URL}/minha-conta/pedidos/${pedidoId}">Minha Conta</a> para acompanhar.`,
        )
      }
    } catch (err) {
      this.logger.error(`Erro ao enviar e-mail rejeição cancelamento pedido ${pedidoId}: ${(err as Error).message}`)
    }

    return resultado
  }
}
