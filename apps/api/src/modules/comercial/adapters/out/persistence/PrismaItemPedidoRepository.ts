import { Injectable } from '@nestjs/common'
import { ItemPedido as PrismaItemPedido } from '@prisma/client'
import { IItemPedidoRepository, ItemPedido } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaItemPedidoRepository implements IItemPedidoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPedido(pedidoId: string): Promise<ItemPedido[]> {
    const records = await this.prisma.itemPedido.findMany({ where: { pedidoId } })
    return records.map((r) => this.toDomain(r))
  }

  async saveMany(itens: ItemPedido[]): Promise<ItemPedido[]> {
    await this.prisma.itemPedido.createMany({
      data: itens.map((i) => ({
        id: i.id,
        pedidoId: i.pedidoId,
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
      })),
    })
    return itens
  }

  private toDomain(r: PrismaItemPedido): ItemPedido {
    return new ItemPedido({
      id: r.id,
      pedidoId: r.pedidoId,
      produtoId: r.produtoId,
      quantidade: r.quantidade,
      precoUnitario: Number(r.precoUnitario),
    })
  }
}
