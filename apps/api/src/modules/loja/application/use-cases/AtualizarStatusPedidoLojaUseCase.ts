import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { IClienteRepository, IPedidoLojaRepository, PedidoLoja } from '@apa/core'
import { StatusPedidoLoja } from '@apa/shared'
import { CLIENTE_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://apabee.vercel.app'

const EMAILS: Partial<Record<StatusPedidoLoja, { assunto: string; corpo: (id: string) => string }>> = {
  [StatusPedidoLoja.EM_PREPARACAO]: {
    assunto: 'Seu pedido está sendo preparado',
    corpo: (id) => `Boa notícia! Nossa equipe já começou a preparar seu pedido.<br><br>
Em breve ele estará pronto para envio. Acompanhe em <a href="${FRONTEND_URL}/minha-conta/pedidos/${id}">Minha Conta</a>.`,
  },
  [StatusPedidoLoja.SAIU_ENTREGA]: {
    assunto: 'Seu pedido saiu para entrega! 🚚',
    corpo: (id) => `Seu pedido está a caminho! Fique atento ao recebimento.<br><br>
Em caso de dúvidas, entre em contato conosco. Acompanhe em <a href="${FRONTEND_URL}/minha-conta/pedidos/${id}">Minha Conta</a>.`,
  },
  [StatusPedidoLoja.ENTREGUE]: {
    assunto: 'Pedido entregue. Obrigado! 🍯',
    corpo: (id) => `Seu pedido foi entregue com sucesso. Muito obrigado pela preferência!<br><br>
Esperamos que você goste dos produtos da APA. <a href="${FRONTEND_URL}/loja">Volte sempre</a>!`,
  },
  [StatusPedidoLoja.CANCELADO]: {
    assunto: 'Pedido cancelado',
    corpo: (id) => `Infelizmente seu pedido foi cancelado.<br><br>
Em caso de dúvidas entre em contato conosco. Acesse <a href="${FRONTEND_URL}/minha-conta/pedidos/${id}">Minha Conta</a> para verificar os detalhes.`,
  },
}

@Injectable()
export class AtualizarStatusPedidoLojaUseCase {
  private readonly logger = new Logger(AtualizarStatusPedidoLojaUseCase.name)

  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    private readonly notificacao: NotificacaoService,
  ) {}

  async execute(pedidoId: string, novoStatus: StatusPedidoLoja): Promise<PedidoLoja> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException('Pedido não encontrado.')

    let atualizado: PedidoLoja
    try {
      atualizado = novoStatus === StatusPedidoLoja.CANCELADO
        ? pedido.cancelar()
        : pedido.avancarStatus(novoStatus)
    } catch (err: unknown) {
      // Converte erros de domínio (transição inválida) em 400 em vez de 500
      throw new BadRequestException(err instanceof Error ? err.message : 'Transição de status inválida.')
    }

    const resultado = await this.pedidoRepo.update(atualizado)

    const emailCfg = EMAILS[novoStatus]
    if (emailCfg) {
      try {
        const cliente = await this.clienteRepo.findById(pedido.clienteId)
        if (cliente) {
          void this.notificacao.enviarEmailDireto(cliente.email, emailCfg.assunto, emailCfg.corpo(pedidoId))
        }
      } catch (err) {
        this.logger.error(`Erro ao enviar e-mail status ${novoStatus} pedido ${pedidoId}: ${(err as Error).message}`)
      }
    }

    return resultado
  }
}
