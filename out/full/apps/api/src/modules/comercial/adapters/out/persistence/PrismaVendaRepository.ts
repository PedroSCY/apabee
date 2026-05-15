import { Injectable } from '@nestjs/common'
import { Venda as PrismaVenda } from '@prisma/client'
import { IVendaRepository, Venda } from '@apa/core'
import { TipoVenda } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaVendaRepository implements IVendaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Venda | null> {
    const r = await this.prisma.venda.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string): Promise<Venda[]> {
    const records = await this.prisma.venda.findMany({
      where: { campanhaId },
      orderBy: { data: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findByAssociado(associadoId: string): Promise<Venda[]> {
    const records = await this.prisma.venda.findMany({
      where: { associadoId },
      orderBy: { data: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(venda: Venda): Promise<Venda> {
    const r = await this.prisma.venda.create({
      data: {
        id: venda.id,
        campanhaId: venda.campanhaId ?? null,
        associadoId: venda.associadoId ?? null,
        tipo: venda.tipo,
        volume: venda.volume,
        valor: venda.valor,
        data: venda.data,
      },
    })
    return this.toDomain(r)
  }

  private toDomain(r: PrismaVenda): Venda {
    return new Venda({
      id: r.id,
      campanhaId: r.campanhaId ?? undefined,
      associadoId: r.associadoId ?? undefined,
      tipo: r.tipo as TipoVenda,
      volume: Number(r.volume),
      valor: Number(r.valor),
      data: r.data,
    })
  }
}
