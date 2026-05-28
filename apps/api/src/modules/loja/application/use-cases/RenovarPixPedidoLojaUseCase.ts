import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IClienteRepository,
  IConfiguracaoLojaRepository,
  IPedidoLojaRepository,
  IPaymentGateway,
  PedidoLoja,
} from '@apa/core'
import { StatusPedidoLoja } from '@apa/shared'
import { CLIENTE_REPOSITORY, CONFIGURACAO_LOJA_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { PAYMENT_GATEWAY } from '../../../financeiro/financeiro.tokens'

@Injectable()
export class RenovarPixPedidoLojaUseCase {
  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    @Inject(CONFIGURACAO_LOJA_REPOSITORY) private readonly configRepo: IConfiguracaoLojaRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
  ) {}

  async execute(pedidoId: string, clienteId: string): Promise<PedidoLoja> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException('Pedido não encontrado.')
    if (pedido.clienteId !== clienteId) throw new BadRequestException('Acesso negado.')
    if (pedido.status !== StatusPedidoLoja.AGUARDANDO_PAGAMENTO) {
      throw new BadRequestException('Apenas pedidos aguardando pagamento podem ter o PIX renovado.')
    }
    if (!pedido.pixExpirado()) {
      throw new BadRequestException('O PIX ainda não expirou.')
    }

    if (pedido.cobrancaGatewayId) {
      await this.gateway.cancelarCobranca(pedido.cobrancaGatewayId).catch(() => {})
    }

    const config = await this.configRepo.obter()
    const cliente = await this.clienteRepo.findById(clienteId)
    const expiracaoEm = new Date(Date.now() + config.pixExpiracaoMinutos * 60 * 1000)

    const cobranca = await this.gateway.criarCobranca({
      referenciaId: pedidoId,
      valor: pedido.valorTotal,
      descricao: `Pedido Loja APA #${pedidoId.slice(0, 8)} (renovado)`,
      nomeCliente: cliente?.nome ?? 'Cliente',
      emailCliente: cliente?.email,
      vencimento: expiracaoEm,
      metodoPagamento: 'PIX',
    })

    const atualizado = pedido.registrarCobrancaPix(
      cobranca.gatewayId,
      cobranca.pixCopiaECola ?? '',
      cobranca.pixQrCodeBase64 ?? '',
      expiracaoEm,
    )

    return this.pedidoRepo.update(atualizado)
  }
}
