import { Injectable } from '@nestjs/common'
import { Florada, IFloradaRepository } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'
import { randomUUID } from 'crypto'

@Injectable()
export class PrismaFloradaRepository implements IFloradaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(apenasAtivas?: boolean): Promise<Florada[]> {
    const rs = await this.prisma.florada.findMany({
      where: apenasAtivas ? { ativa: true } : undefined,
      orderBy: { nome: 'asc' },
    })
    return rs.map(r => this.toDomain(r))
  }

  async findById(id: string): Promise<Florada | null> {
    const r = await this.prisma.florada.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async save(florada: Florada): Promise<Florada> {
    const existing = await this.prisma.florada.findUnique({ where: { id: florada.id } })
    if (existing) {
      const r = await this.prisma.florada.update({
        where: { id: florada.id },
        data: { nome: florada.nome, descricao: florada.descricao ?? null, ativa: florada.ativa },
      })
      return this.toDomain(r)
    }
    const r = await this.prisma.florada.create({
      data: {
        id: florada.id || randomUUID(),
        nome: florada.nome,
        descricao: florada.descricao ?? null,
        ativa: florada.ativa,
      },
    })
    return this.toDomain(r)
  }

  private toDomain(r: any): Florada {
    return new Florada({
      id: r.id,
      nome: r.nome,
      descricao: r.descricao ?? undefined,
      ativa: r.ativa,
      criadoEm: r.criadoEm,
    })
  }
}
