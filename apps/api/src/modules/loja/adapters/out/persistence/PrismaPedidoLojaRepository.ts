import { Injectable } from '@nestjs/common'
import { EnderecoEntregaSnapshot, FindPedidosLojaParams, IPedidoLojaRepository, ItemPedidoLoja, PedidoLoja } from '@apa/core'
import { MetodoPagamentoPedidoLoja, OpcaoEntrega, StatusPedidoLoja } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

// Inclui itens e endereço de entrega em todas as consultas
const INCLUDE = { itens: true, endereco: true } as const

@Injectable()
export class PrismaPedidoLojaRepository implements IPedidoLojaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PedidoLoja | null> {
    const r = await this.prisma.pedidoLoja.findUnique({
      where: { id },
      include: INCLUDE,
    })
    return r ? this.toDomain(r) : null
  }

  async findByClienteId(
    clienteId: string,
    page = 1,
    limit = 10,
  ): Promise<{ pedidos: PedidoLoja[]; total: number }> {
    const skip = (page - 1) * limit
    const [rows, total] = await Promise.all([
      this.prisma.pedidoLoja.findMany({
        where: { clienteId },
        include: INCLUDE,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pedidoLoja.count({ where: { clienteId } }),
    ])
    return { pedidos: rows.map(r => this.toDomain(r)), total }
  }

  async findAll(params?: FindPedidosLojaParams): Promise<{ pedidos: PedidoLoja[]; total: number }> {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 20
    const skip = (page - 1) * limit

    const where: any = {}
    if (params?.status) where.status = params.status
    if (params?.opcaoEntrega) where.opcaoEntrega = params.opcaoEntrega
    if (params?.dataInicio || params?.dataFim) {
      where.criadoEm = {
        ...(params.dataInicio ? { gte: params.dataInicio } : {}),
        ...(params.dataFim ? { lte: params.dataFim } : {}),
      }
    }
    if (params?.clienteEmail) {
      where.cliente = { email: { contains: params.clienteEmail, mode: 'insensitive' } }
    }

    const [rows, total] = await Promise.all([
      this.prisma.pedidoLoja.findMany({
        where,
        include: INCLUDE,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pedidoLoja.count({ where }),
    ])
    return { pedidos: rows.map(r => this.toDomain(r)), total }
  }

  async findByCobrancaGatewayId(gatewayId: string): Promise<PedidoLoja | null> {
    const r = await this.prisma.pedidoLoja.findFirst({
      where: { cobrancaGatewayId: gatewayId },
      include: INCLUDE,
    })
    return r ? this.toDomain(r) : null
  }

  async save(pedido: PedidoLoja): Promise<PedidoLoja> {
    const r = await this.prisma.pedidoLoja.create({
      data: {
        id: pedido.id,
        clienteId: pedido.clienteId,
        status: pedido.status,
        opcaoEntrega: pedido.opcaoEntrega,
        enderecoEntregaId: pedido.enderecoEntregaId ?? null,
        valorTotal: pedido.valorTotal,
        observacoes: pedido.observacoes ?? null,
        metodoPagamento: pedido.metodoPagamento ?? null,
        cobrancaGatewayId: pedido.cobrancaGatewayId ?? null,
        cobrancaPixCopiaECola: pedido.cobrancaPixCopiaECola ?? null,
        cobrancaPixQrCodeBase64: pedido.cobrancaPixQrCodeBase64 ?? null,
        cobrancaExpiracaoEm: pedido.cobrancaExpiracaoEm ?? null,
        cobrancaValorCobrado: pedido.cobrancaValorCobrado ?? null,
        cardInstallments: pedido.cardInstallments ?? null,
        cardPaymentMethodId: pedido.cardPaymentMethodId ?? null,
        itens: {
          create: pedido.itens.map(item => ({
            id: item.id,
            produtoId: item.produtoId,
            nomeProduto: item.nomeProduto,
            precoUnitario: item.precoUnitario,
            quantidade: item.quantidade,
            campanhaCodigo: item.campanhaCodigo ?? null,
          })),
        },
      },
      include: INCLUDE,
    })
    return this.toDomain(r)
  }

  async update(pedido: PedidoLoja): Promise<PedidoLoja> {
    const r = await this.prisma.pedidoLoja.update({
      where: { id: pedido.id },
      data: {
        status: pedido.status,
        cobrancaGatewayId: pedido.cobrancaGatewayId ?? null,
        cobrancaPixCopiaECola: pedido.cobrancaPixCopiaECola ?? null,
        cobrancaPixQrCodeBase64: pedido.cobrancaPixQrCodeBase64 ?? null,
        cobrancaExpiracaoEm: pedido.cobrancaExpiracaoEm ?? null,
        cobrancaValorCobrado: pedido.cobrancaValorCobrado ?? null,
        cardInstallments: pedido.cardInstallments ?? null,
        cardPaymentMethodId: pedido.cardPaymentMethodId ?? null,
      },
      include: INCLUDE,
    })
    return this.toDomain(r)
  }

  private toDomain(r: any): PedidoLoja {
    const itens: ItemPedidoLoja[] = (r.itens ?? []).map((item: any) => ({
      id: item.id,
      pedidoLojaId: item.pedidoLojaId,
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      precoUnitario: Number(item.precoUnitario),
      quantidade: item.quantidade,
      campanhaCodigo: item.campanhaCodigo ?? undefined,
    }))

    let enderecoEntregaSnapshot: EnderecoEntregaSnapshot | undefined
    if (r.endereco) {
      enderecoEntregaSnapshot = {
        apelido: r.endereco.apelido,
        logradouro: r.endereco.logradouro,
        numero: r.endereco.numero,
        complemento: r.endereco.complemento ?? undefined,
        bairro: r.endereco.bairro,
        cidade: r.endereco.cidade,
        estado: r.endereco.estado,
        cep: r.endereco.cep,
      }
    }

    return new PedidoLoja({
      id: r.id,
      clienteId: r.clienteId,
      status: r.status as StatusPedidoLoja,
      opcaoEntrega: r.opcaoEntrega as OpcaoEntrega,
      enderecoEntregaId: r.enderecoEntregaId ?? undefined,
      valorTotal: Number(r.valorTotal),
      observacoes: r.observacoes ?? undefined,
      metodoPagamento: r.metodoPagamento as MetodoPagamentoPedidoLoja | undefined,
      itens,
      cobrancaGatewayId: r.cobrancaGatewayId ?? undefined,
      cobrancaPixCopiaECola: r.cobrancaPixCopiaECola ?? undefined,
      cobrancaPixQrCodeBase64: r.cobrancaPixQrCodeBase64 ?? undefined,
      cobrancaExpiracaoEm: r.cobrancaExpiracaoEm ?? undefined,
      cobrancaValorCobrado: r.cobrancaValorCobrado ? Number(r.cobrancaValorCobrado) : undefined,
      cardInstallments: r.cardInstallments ?? undefined,
      cardPaymentMethodId: r.cardPaymentMethodId ?? undefined,
      criadoEm: r.criadoEm,
      enderecoEntregaSnapshot,
    })
  }
}
