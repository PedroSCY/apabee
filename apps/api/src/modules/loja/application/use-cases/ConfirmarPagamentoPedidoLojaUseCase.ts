import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  IClienteRepository,
  IConfiguracaoLojaRepository,
  IEstoqueProdutoRepository,
  IPedidoLojaRepository,
  PedidoLoja,
} from '@apa/core'
import { MetodoPagamentoPedidoLoja, OpcaoEntrega } from '@apa/shared'
import { CLIENTE_REPOSITORY, CONFIGURACAO_LOJA_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { ESTOQUE_PRODUTO_REPOSITORY } from '../../../catalogo/catalogo.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://apabee.vercel.app'

const ENTREGA_LABEL: Record<string, string> = {
  PRATA_GRATIS: 'Entrega em Prata - PB (Grátis)',
  RETIRADA_LOCAL: 'Retirada na sede da APA',
  A_COMBINAR: 'Outra cidade — A combinar',
  CORREIOS: 'Correios',
}

@Injectable()
export class ConfirmarPagamentoPedidoLojaUseCase {
  private readonly logger = new Logger(ConfirmarPagamentoPedidoLojaUseCase.name)

  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY) private readonly estoqueRepo: IEstoqueProdutoRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    @Inject(CONFIGURACAO_LOJA_REPOSITORY) private readonly configRepo: IConfiguracaoLojaRepository,
    private readonly notificacao: NotificacaoService,
  ) {}

  async execute(pedidoId: string): Promise<PedidoLoja> {
    const pedido = await this.pedidoRepo.findById(pedidoId)
    if (!pedido) throw new NotFoundException('Pedido não encontrado.')

    const confirmado = pedido.confirmarPagamento()

    for (const item of pedido.itens) {
      try {
        const estoque = await this.estoqueRepo.findByProduto(item.produtoId)
        if (estoque && estoque.temSaldo(item.quantidade)) {
          await this.estoqueRepo.save(estoque.saida(item.quantidade))
        } else {
          this.logger.warn(`Estoque insuficiente ao confirmar pedido ${pedidoId} para produto ${item.produtoId}`)
        }
      } catch (err) {
        this.logger.error(`Erro ao debitar estoque produto ${item.produtoId}: ${(err as Error).message}`)
      }
    }

    const resultado = await this.pedidoRepo.update(confirmado)

    // ─── Email ao cliente ────────────────────────────────────────────────────
    try {
      const cliente = await this.clienteRepo.findById(pedido.clienteId)
      if (cliente) {
        const metodoLabel = pedido.metodoPagamento === MetodoPagamentoPedidoLoja.CARTAO
          ? 'cartão de crédito'
          : 'PIX'

        void this.notificacao.enviarEmailDireto(
          cliente.email,
          'Pagamento confirmado! ✓',
          `Seu pagamento via <strong>${metodoLabel}</strong> foi confirmado e seu pedido está em processo.<br><br>
<strong>Total:</strong> ${fmt(pedido.valorTotal)}<br><br>
Em breve nossa equipe começará a preparar seu pedido. Acompanhe em <a href="${FRONTEND_URL}/minha-conta/pedidos/${pedidoId}">Minha Conta</a>.`,
        )
      }
    } catch (err) {
      this.logger.error(`Erro ao enviar e-mail de confirmação pedido ${pedidoId}: ${(err as Error).message}`)
    }

    // ─── Email de notificação ao admin ───────────────────────────────────────
    try {
      const config = await this.configRepo.obter()
      if (config.emailResponsavel) {
        const itensHtml = pedido.itens
          .map(item =>
            `<tr>
              <td style="padding:4px 8px">${item.nomeProduto}${item.campanhaCodigo ? ` <small>(${item.campanhaCodigo})</small>` : ''}</td>
              <td style="padding:4px 8px;text-align:center">${item.quantidade}</td>
              <td style="padding:4px 8px;text-align:right">${fmt(item.precoUnitario * item.quantidade)}</td>
            </tr>`,
          )
          .join('')

        const enderecoHtml = (() => {
          if (pedido.opcaoEntrega === OpcaoEntrega.RETIRADA_LOCAL) {
            return '<p>📍 <strong>Retirada na sede da APA</strong></p>'
          }
          const snap = pedido.enderecoEntregaSnapshot
          if (snap) {
            return `<p>
              ${snap.logradouro}, ${snap.numero}${snap.complemento ? `, ${snap.complemento}` : ''}<br>
              ${snap.bairro} · ${snap.cidade}/${snap.estado}<br>
              CEP: ${snap.cep}
            </p>`
          }
          return `<p>${ENTREGA_LABEL[pedido.opcaoEntrega] ?? pedido.opcaoEntrega}</p>`
        })()

        void this.notificacao.enviarEmailDireto(
          config.emailResponsavel,
          `🛒 Novo pedido confirmado — #${pedidoId.slice(0, 8)}`,
          `<h2 style="margin-bottom:8px">Novo pedido para despacho</h2>
<p><strong>Pedido:</strong> #${pedidoId.slice(0, 8)}</p>
<p><strong>Total:</strong> ${fmt(pedido.valorTotal)}</p>

<h3 style="margin-top:16px;margin-bottom:8px">Itens</h3>
<table style="border-collapse:collapse;width:100%">
  <thead>
    <tr style="background:#f3f4f6">
      <th style="padding:4px 8px;text-align:left">Produto</th>
      <th style="padding:4px 8px">Qtd</th>
      <th style="padding:4px 8px;text-align:right">Subtotal</th>
    </tr>
  </thead>
  <tbody>${itensHtml}</tbody>
</table>

<h3 style="margin-top:16px;margin-bottom:8px">Entrega</h3>
<p><strong>${ENTREGA_LABEL[pedido.opcaoEntrega] ?? pedido.opcaoEntrega}</strong></p>
${enderecoHtml}

<p style="margin-top:16px">
  <a href="${FRONTEND_URL}/gerenciar-loja/pedidos/${pedidoId}" style="background:#7c3aed;color:white;padding:8px 16px;border-radius:6px;text-decoration:none">
    Ver pedido no painel
  </a>
</p>`,
        )
      }
    } catch (err) {
      this.logger.error(`Erro ao enviar e-mail de notificação admin pedido ${pedidoId}: ${(err as Error).message}`)
    }

    return resultado
  }
}
