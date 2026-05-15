import { Injectable } from '@nestjs/common'
import { Cota, ICotaRepository } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaCotaRepository implements ICotaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Cota | null> {
    const r = await this.prisma.cota.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string): Promise<Cota[]> {
    const rs = await this.prisma.cota.findMany({ where: { campanhaId }, orderBy: { data: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async findByAssociado(associadoId: string): Promise<Cota[]> {
    const rs = await this.prisma.cota.findMany({ where: { associadoId }, orderBy: { data: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async sumByCampanha(campanhaId: string): Promise<number> {
    const result = await this.prisma.cota.aggregate({ where: { campanhaId, pago: true }, _sum: { valor: true } })
    return Number(result._sum.valor ?? 0)
  }

  async save(cota: Cota): Promise<Cota> {
    const r = await this.prisma.cota.create({
      data: { id: cota.id, campanhaId: cota.campanhaId, associadoId: cota.associadoId, valor: cota.valor, data: cota.data, pago: cota.pago, confirmadoEm: cota.confirmadoEm ?? null },
    })
    return this.toDomain(r)
  }

  async update(cota: Cota): Promise<Cota> {
    const r = await this.prisma.cota.update({ where: { id: cota.id }, data: { pago: cota.pago, confirmadoEm: cota.confirmadoEm ?? null } })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cota.delete({ where: { id } })
  }

  private toDomain(r: any): Cota {
    return new Cota({ id: r.id, campanhaId: r.campanhaId, associadoId: r.associadoId, valor: Number(r.valor), data: r.data, pago: r.pago, confirmadoEm: r.confirmadoEm ?? undefined })
  }
}
