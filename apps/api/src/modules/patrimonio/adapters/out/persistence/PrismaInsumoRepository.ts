import { Injectable } from '@nestjs/common'
import { Insumo as PrismaInsumo } from '@prisma/client'
import { IInsumoRepository, Insumo } from '@apa/core'
import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaInsumoRepository implements IInsumoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Insumo | null> {
    const record = await this.prisma.insumo.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<Insumo[]> {
    const records = await this.prisma.insumo.findMany({ orderBy: { criadoEm: 'desc' } })
    return records.map(this.toDomain)
  }

  async save(insumo: Insumo): Promise<Insumo> {
    const record = await this.prisma.insumo.create({
      data: {
        id: insumo.id,
        nome: insumo.nome,
        categoria: insumo.categoria,
        descricao: insumo.descricao,
        status: insumo.status,
        criadoEm: insumo.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  async update(insumo: Insumo): Promise<Insumo> {
    const record = await this.prisma.insumo.update({
      where: { id: insumo.id },
      data: {
        nome: insumo.nome,
        descricao: insumo.descricao,
        status: insumo.status,
      },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.insumo.delete({ where: { id } })
  }

  private toDomain(record: PrismaInsumo): Insumo {
    return new Insumo({
      id: record.id,
      nome: record.nome,
      categoria: record.categoria as CategoriaInsumo,
      descricao: record.descricao ?? undefined,
      status: record.status as StatusPatrimonio,
      criadoEm: record.criadoEm,
    })
  }
}
