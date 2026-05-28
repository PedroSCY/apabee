import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  IClienteRepository,
  IConfiguracaoLojaRepository,
  IEstoqueProdutoRepository,
  IPedidoLojaRepository,
  IProdutoRepository,
  IPaymentGateway,
  PedidoLoja,
} from '@apa/core'
import { MetodoPagamentoPedidoLoja, OpcaoEntrega, StatusPedidoLoja } from '@apa/shared'
import { CLIENTE_REPOSITORY, CONFIGURACAO_LOJA_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'
import { PRODUTO_REPOSITORY, ESTOQUE_PRODUTO_REPOSITORY } from '../../../catalogo/catalogo.tokens'
import { PAYMENT_GATEWAY } from '../../../financeiro/financeiro.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://apabee.vercel.app'
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export interface CheckoutItemInput {
  produtoId: string
  quantidade: number
}

export interface CheckoutInput {
  clienteId: string
  itens: CheckoutItemInput[]
  opcaoEntrega: OpcaoEntrega
  enderecoEntregaId?: string
  observacoes?: string
  metodoPagamento: 'PIX' | 'CARTAO'
  cardToken?: string
  cardInstallments?: number
  cardPaymentMethodId?: string
  cardIssuerId?: string
}

export interface CheckoutResult {
  pedidoId: string
  status: StatusPedidoLoja
  aprovado: boolean
  valorTotal: number
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  expiracaoEm?: Date
  cardInstallments?: number
  motivoRejeicao?: string
}

@Injectable()
export class CheckoutPedidoLojaUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
    @Inject(CONFIGURACAO_LOJA_REPOSITORY) private readonly configRepo: IConfiguracaoLojaRepository,
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepo: IProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY) private readonly estoqueRepo: IEstoqueProdutoRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    private readonly notificacao: NotificacaoService,
  ) {}

  async execute(input: CheckoutInput): Promise<CheckoutResult> {
    if (!input.itens.length) throw new BadRequestException('O pedido deve ter ao menos um item.')

    const config = await this.configRepo.obter()

    if (input.metodoPagamento === 'PIX' && !config.aceitaPix) {
      throw new BadRequestException('PIX não está disponível no momento.')
    }
    if (input.metodoPagamento === 'CARTAO' && !config.aceitaCartao) {
      throw new BadRequestException('Pagamento por cartão não está disponível.')
    }
    if (input.metodoPagamento === 'CARTAO' && !input.cardToken) {
      throw new BadRequestException('Token do cartão é obrigatório para pagamento por cartão.')
    }

    // [A3] Validação de endereço obrigatório por modalidade de entrega
    const ENTREGA_REQUER_ENDERECO = [OpcaoEntrega.PRATA_GRATIS, OpcaoEntrega.CORREIOS]
    if (ENTREGA_REQUER_ENDERECO.includes(input.opcaoEntrega) && !input.enderecoEntregaId) {
      throw new BadRequestException('Endereço de entrega obrigatório para esta modalidade.')
    }

    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundException('Cliente não encontrado.')

    const pedidoId = randomUUID()
    const itens: PedidoLoja['itens'] extends Array<infer T> ? T[] : never[] = []
    let valorTotal = 0

    for (const itemIn of input.itens) {
      const produto = await this.produtoRepo.findById(itemIn.produtoId)
      if (!produto) throw new NotFoundException(`Produto ${itemIn.produtoId} não encontrado.`)
      if (!produto.estaDisponivel()) throw new BadRequestException(`Produto "${produto.nome}" não está disponível.`)

      const estoque = await this.estoqueRepo.findByProduto(itemIn.produtoId)
      if (!estoque || !estoque.temSaldo(itemIn.quantidade)) {
        throw new BadRequestException(`Saldo insuficiente para "${produto.nome}".`)
      }

      itens.push({
        id: randomUUID(),
        pedidoLojaId: pedidoId,
        produtoId: produto.id,
        nomeProduto: produto.nome,
        precoUnitario: produto.preco,
        quantidade: itemIn.quantidade,
        campanhaCodigo: produto.campanhaId ?? undefined,
      })
      valorTotal += produto.preco * itemIn.quantidade
    }

    const metodo = input.metodoPagamento === 'CARTAO'
      ? MetodoPagamentoPedidoLoja.CARTAO
      : MetodoPagamentoPedidoLoja.PIX

    if (input.metodoPagamento === 'CARTAO') {
      return this.processarCartao(input, pedidoId, itens as any, valorTotal, metodo, config, cliente)
    }

    return this.processarPix(input, pedidoId, itens as any, valorTotal, metodo, config, cliente)
  }

  private async processarPix(
    input: CheckoutInput,
    pedidoId: string,
    itens: any[],
    valorTotal: number,
    metodo: MetodoPagamentoPedidoLoja,
    config: any,
    cliente: any,
  ): Promise<CheckoutResult> {
    const expiracaoEm = new Date(Date.now() + config.pixExpiracaoMinutos * 60 * 1000)

    let pedido = new PedidoLoja({
      id: pedidoId,
      clienteId: input.clienteId,
      status: StatusPedidoLoja.AGUARDANDO_PAGAMENTO,
      opcaoEntrega: input.opcaoEntrega,
      enderecoEntregaId: input.enderecoEntregaId,
      valorTotal,
      observacoes: input.observacoes,
      metodoPagamento: metodo,
      itens,
      criadoEm: new Date(),
    })

    const cobranca = await this.gateway.criarCobranca({
      referenciaId: pedidoId,
      valor: valorTotal,
      descricao: `Pedido Loja APA #${pedidoId.slice(0, 8)}`,
      nomeCliente: cliente.nome,
      emailCliente: cliente.email,
      vencimento: expiracaoEm,
      metodoPagamento: 'PIX',
    })

    pedido = pedido.registrarCobrancaPix(
      cobranca.gatewayId,
      cobranca.pixCopiaECola ?? '',
      cobranca.pixQrCodeBase64 ?? '',
      expiracaoEm,
    )

    await this.pedidoRepo.save(pedido)

    void this.notificacao.enviarEmailDireto(
      cliente.email,
      'Pedido criado! Pague com PIX',
      `Seu pedido foi criado com sucesso! Para confirmar, realize o pagamento via PIX antes do prazo.<br><br>
<strong>Valor:</strong> ${fmt(valorTotal)}<br>
<strong>Expira em:</strong> ${expiracaoEm.toLocaleString('pt-BR')}<br><br>
<strong>PIX Copia e Cola:</strong><br>
<code style="background:#f3f4f6;padding:8px;border-radius:4px;display:block;word-break:break-all;font-size:12px;">${cobranca.pixCopiaECola ?? ''}</code><br><br>
Acompanhe seu pedido em <a href="${FRONTEND_URL}/minha-conta/pedidos/${pedidoId}">Minha Conta</a>.`,
    )

    return {
      pedidoId,
      status: StatusPedidoLoja.AGUARDANDO_PAGAMENTO,
      aprovado: false,
      valorTotal,
      pixCopiaECola: cobranca.pixCopiaECola,
      pixQrCodeBase64: cobranca.pixQrCodeBase64,
      expiracaoEm,
    }
  }

  private async processarCartao(
    input: CheckoutInput,
    pedidoId: string,
    itens: any[],
    valorTotal: number,
    metodo: MetodoPagamentoPedidoLoja,
    config: any,
    cliente: any,
  ): Promise<CheckoutResult> {
    const cobranca = await this.gateway.criarCobranca({
      referenciaId: pedidoId,
      valor: valorTotal,
      descricao: `Pedido Loja APA #${pedidoId.slice(0, 8)}`,
      nomeCliente: cliente.nome,
      metodoPagamento: 'CARTAO',
      cardToken: input.cardToken,
      cardInstallments: input.cardInstallments ?? 1,
      cardPaymentMethodId: input.cardPaymentMethodId,
      cardIssuerId: input.cardIssuerId,
    })

    if (cobranca.status === 'rejected') {
      throw new BadRequestException(cobranca.motivoRejeicao ?? 'Pagamento recusado.')
    }

    const status = cobranca.status === 'approved'
      ? StatusPedidoLoja.PAGO
      : StatusPedidoLoja.AGUARDANDO_PAGAMENTO

    let pedido = new PedidoLoja({
      id: pedidoId,
      clienteId: input.clienteId,
      status,
      opcaoEntrega: input.opcaoEntrega,
      enderecoEntregaId: input.enderecoEntregaId,
      valorTotal,
      observacoes: input.observacoes,
      metodoPagamento: metodo,
      itens,
      criadoEm: new Date(),
    })

    pedido = pedido.registrarCobrancaCartao(
      cobranca.gatewayId,
      input.cardInstallments ?? 1,
      input.cardPaymentMethodId ?? '',
      cobranca.valorCobrado,
    )

    await this.pedidoRepo.save(pedido)

    if (status === StatusPedidoLoja.PAGO) {
      await this.debitarEstoque(itens)
      void this.notificacao.enviarEmailDireto(
        cliente.email,
        'Pagamento confirmado! ✓',
        `Seu pagamento foi aprovado e seu pedido está confirmado!<br><br>
<strong>Total:</strong> ${fmt(valorTotal)}<br><br>
Em breve nossa equipe começará a preparar seu pedido. Acompanhe em <a href="${FRONTEND_URL}/minha-conta/pedidos/${pedidoId}">Minha Conta</a>.`,
      )
    } else {
      void this.notificacao.enviarEmailDireto(
        cliente.email,
        'Pagamento em análise',
        `Recebemos seu pedido! Seu banco está analisando o pagamento.<br><br>
Assim que confirmado, você receberá um novo e-mail. Acompanhe em <a href="${FRONTEND_URL}/minha-conta/pedidos/${pedidoId}">Minha Conta</a>.`,
      )
    }

    return {
      pedidoId,
      status,
      aprovado: status === StatusPedidoLoja.PAGO,
      valorTotal,
      cardInstallments: input.cardInstallments,
    }
  }

  private async debitarEstoque(itens: any[]): Promise<void> {
    for (const item of itens) {
      const estoque = await this.estoqueRepo.findByProduto(item.produtoId)
      if (estoque) {
        const atualizado = estoque.saida(item.quantidade)
        await this.estoqueRepo.save(atualizado)
      }
    }
  }
}
