import { Injectable } from '@nestjs/common'
import { PedidoAquisicao, IPedidoAquisicaoRepository } from '@apa/core'
import { OrigemContribuicao } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaPedidoAquisicaoRepository implements IPedidoAquisicaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PedidoAquisicao | null> {
    const r = await this.prisma.pedidoAquisicao.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string): Promise<PedidoAquisicao[]> {
    const rs = await this.prisma.pedidoAquisicao.findMany({ where: { campanhaId }, orderBy: { criadoEm: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async findByAssociadoECampanha(associadoId: string, campanhaId: string): Promise<PedidoAquisicao[]> {
    const rs = await this.prisma.pedidoAquisicao.findMany({ where: { associadoId, campanhaId } })
    return rs.map(r => this.toDomain(r))
  }

  async save(pedido: PedidoAquisicao): Promise<PedidoAquisicao> {
    const r = await this.prisma.pedidoAquisicao.create({ data: this.toData(pedido) })
    return this.toDomain(r)
  }

  async update(pedido: PedidoAquisicao): Promise<PedidoAquisicao> {
    const r = await this.prisma.pedidoAquisicao.update({ where: { id: pedido.id }, data: this.toData(pedido) })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pedidoAquisicao.delete({ where: { id } })
  }

  private toData(p: PedidoAquisicao) {
    return {
      id: p.id,
      campanhaId: p.campanhaId,
      itemAquisicaoId: p.itemAquisicaoId,
      associadoId: p.associadoId ?? null,
      origem: p.origem,
      quantidade: p.quantidade,
      valorTotal: p.valorTotal,
      pago: p.pago,
      pagoEm: p.pagoEm ?? null,
      entregue: p.entregue,
      entregueEm: p.entregueEm ?? null,
      criadoEm: p.criadoEm,
    }
  }

  private toDomain(r: any): PedidoAquisicao {
    return new PedidoAquisicao({
      id: r.id,
      campanhaId: r.campanhaId,
      itemAquisicaoId: r.itemAquisicaoId,
      associadoId: r.associadoId ?? undefined,
      origem: r.origem as OrigemContribuicao,
      quantidade: r.quantidade,
      valorTotal: Number(r.valorTotal),
      pago: r.pago,
      pagoEm: r.pagoEm ?? undefined,
      entregue: r.entregue,
      entregueEm: r.entregueEm ?? undefined,
      criadoEm: r.criadoEm,
    })
  }
}
