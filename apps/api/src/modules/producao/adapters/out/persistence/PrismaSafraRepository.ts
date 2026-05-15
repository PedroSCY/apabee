import { Injectable } from '@nestjs/common'
import { ISafraRepository, Safra } from '@apa/core'
import { StatusSafra } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaSafraRepository implements ISafraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Safra | null> {
    const r = await this.prisma.safra.findUnique({ where: { id }, include: { florada: true } })
    return r ? this.toDomain(r) : null
  }

  async findAll(): Promise<Safra[]> {
    const rs = await this.prisma.safra.findMany({ orderBy: { dataInicio: 'desc' }, include: { florada: true } })
    return rs.map(r => this.toDomain(r))
  }

  async findByStatus(status: StatusSafra): Promise<Safra[]> {
    const rs = await this.prisma.safra.findMany({ where: { status }, orderBy: { dataInicio: 'desc' }, include: { florada: true } })
    return rs.map(r => this.toDomain(r))
  }

  async save(safra: Safra): Promise<Safra> {
    const r = await this.prisma.safra.create({
      data: { id: safra.id, nome: safra.nome, floradaId: safra.floradaId, dataInicio: safra.dataInicio, dataFim: safra.dataFim ?? null, status: safra.status },
      include: { florada: true },
    })
    return this.toDomain(r)
  }

  async update(safra: Safra): Promise<Safra> {
    const r = await this.prisma.safra.update({
      where: { id: safra.id },
      data: { nome: safra.nome, dataFim: safra.dataFim ?? null, status: safra.status },
      include: { florada: true },
    })
    return this.toDomain(r)
  }

  private toDomain(r: any): Safra {
    return new Safra({
      id: r.id,
      nome: r.nome,
      floradaId: r.floradaId,
      floradaNome: r.florada?.nome,
      dataInicio: r.dataInicio,
      dataFim: r.dataFim ?? undefined,
      status: r.status as StatusSafra,
    })
  }
}
