import { Injectable } from '@nestjs/common'
import { Pedido as PrismaPedido, ItemPedido as PrismaItemPedido } from '@prisma/client'
import { IPedidoRepository, ItemPedido, Pedido } from '@apa/core'
import { StatusPedido } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

type PedidoWithItems = PrismaPedido & { itens: PrismaItemPedido[] }

@Injectable()
export class PrismaPedidoRepository implements IPedidoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Pedido | null> {
    const r = await this.prisma.pedido.findUnique({
      where: { id },
      include: { itens: true },
    })
    return r ? this.toDomain(r) : null
  }

  async findAll(): Promise<Pedido[]> {
    const records = await this.prisma.pedido.findMany({
      include: { itens: true },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(pedido: Pedido): Promise<Pedido> {
    const r = await this.prisma.pedido.create({
      data: {
        id: pedido.id,
        clienteNome: pedido.clienteNome,
        clienteEmail: pedido.clienteEmail,
        clienteTelefone: pedido.clienteTelefone,
        status: pedido.status,
        total: pedido.calcularTotal(),
        criadoEm: pedido.criadoEm,
      },
      include: { itens: true },
    })
    return this.toDomain(r)
  }

  async update(pedido: Pedido): Promise<Pedido> {
    const r = await this.prisma.pedido.update({
      where: { id: pedido.id },
      data: { status: pedido.status },
      include: { itens: true },
    })
    return this.toDomain(r)
  }

  private toDomain(r: PedidoWithItems): Pedido {
    return new Pedido({
      id: r.id,
      clienteNome: r.clienteNome,
      clienteEmail: r.clienteEmail,
      clienteTelefone: r.clienteTelefone ?? undefined,
      status: r.status as StatusPedido,
      criadoEm: r.criadoEm,
      itens: r.itens.map(
        (i) =>
          new ItemPedido({
            id: i.id,
            pedidoId: i.pedidoId,
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnitario: Number(i.precoUnitario),
          }),
      ),
    })
  }
}
