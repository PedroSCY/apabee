import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { IClienteRepository, IConfiguracaoLojaRepository, IPedidoLojaRepository, PedidoLoja } from '@apa/core'
import { StatusPedidoLoja } from '@apa/shared'
import { CLIENTE_REPOSITORY, CONFIGURACAO_LOJA_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://apabee.vercel.app'
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

@Injectable()
export class SolicitarCancelamentoPedidoLojaUseCase {
  private readonly logger = new Logger(SolicitarCancelamentoPedidoLojaUseCase.name)

  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    @Inject(CONFIGURACAO_LOJA_REPOSITORY) private readonly configRepo: IConfiguracaoLojaRepository,
    private readonly notificacao: NotificacaoService,
  ) {}

  async execute(pedidoId: string, clienteId: string): Promise<PedidoLoja> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException('Pedido não encontrado.')
    if (pedido.clienteId !== clienteId) throw new ForbiddenException('Acesso negado.')

    let atualizado: PedidoLoja

    if (pedido.status === StatusPedidoLoja.AGUARDANDO_PAGAMENTO) {
      // Cancelamento instantâneo — pedido ainda não foi pago
      try {
        atualizado = pedido.cancelar()
      } catch (err: unknown) {
        throw new BadRequestException(err instanceof Error ? err.message : 'Cancelamento não permitido.')
      }
      atualizado = await this.pedidoRepo.update(atualizado)

      // E-mail de confirmação ao cliente
      try {
        const cliente = await this.clienteRepo.findById(clienteId)
        if (cliente) {
          void this.notificacao.enviarEmailDireto(
            cliente.email,
            'Pedido cancelado',
            `Seu pedido <strong>#${pedidoId.slice(0, 8)}</strong> foi cancelado com sucesso.<br><br>
Como o pagamento ainda não havia sido realizado, nenhuma cobrança foi efetuada.`,
          )
        }
      } catch (err) {
        this.logger.error(`Erro ao enviar e-mail cancelamento instantâneo pedido ${pedidoId}: ${(err as Error).message}`)
      }

    } else if (pedido.status === StatusPedidoLoja.PAGO) {
      // Pedido pago — solicita cancelamento para aprovação do admin
      try {
        atualizado = pedido.solicitarCancelamento()
      } catch (err: unknown) {
        throw new BadRequestException(err instanceof Error ? err.message : 'Cancelamento não permitido.')
      }
      atualizado = await this.pedidoRepo.update(atualizado)

      // E-mail ao cliente: solicitação registrada
      try {
        const cliente = await this.clienteRepo.findById(clienteId)
        if (cliente) {
          void this.notificacao.enviarEmailDireto(
            cliente.email,
            'Solicitação de cancelamento recebida',
            `Recebemos sua solicitação de cancelamento para o pedido <strong>#${pedidoId.slice(0, 8)}</strong> (${fmt(pedido.valorTotal)}).<br><br>
Nossa equipe analisará o pedido em breve. Caso aprovado, o estorno será processado e o valor devolvido ao meio de pagamento original.<br><br>
Acompanhe o status em <a href="${FRONTEND_URL}/minha-conta/pedidos/${pedidoId}">Minha Conta</a>.`,
          )
        }
      } catch (err) {
        this.logger.error(`Erro ao enviar e-mail solicitação cancelamento pedido ${pedidoId}: ${(err as Error).message}`)
      }

      // E-mail de alerta ao admin
      try {
        const config = await this.configRepo.obter()
        if (config.emailResponsavel) {
          void this.notificacao.enviarEmailDireto(
            config.emailResponsavel,
            `⚠ Cancelamento solicitado — pedido #${pedidoId.slice(0, 8)}`,
            `Um cliente solicitou o cancelamento do pedido <strong>#${pedidoId.slice(0, 8)}</strong> (${fmt(pedido.valorTotal)}).<br><br>
Este pedido já estava <strong>PAGO</strong> e requer aprovação para processar o estorno.<br><br>
<a href="${FRONTEND_URL}/gerenciar-loja/pedidos/${pedidoId}" style="background:#7c3aed;color:white;padding:8px 16px;border-radius:6px;text-decoration:none">
  Analisar pedido
</a>`,
          )
        }
      } catch (err) {
        this.logger.error(`Erro ao enviar e-mail admin cancelamento solicitado pedido ${pedidoId}: ${(err as Error).message}`)
      }

    } else {
      throw new BadRequestException('Este pedido não pode ser cancelado no status atual.')
    }

    return atualizado
  }
}
