import { Injectable } from '@nestjs/common'
import { Ata as PrismaAta } from '@prisma/client'
import { IAtaRepository, Ata } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaAtaRepository implements IAtaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Ata | null> {
    const record = await this.prisma.ata.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<Ata[]> {
    const records = await this.prisma.ata.findMany({ orderBy: { dataReuniao: 'desc' } })
    return records.map((r) => this.toDomain(r))
  }

  async findPublicadas(): Promise<Ata[]> {
    const records = await this.prisma.ata.findMany({
      where: { publicada: true },
      orderBy: { dataReuniao: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(ata: Ata): Promise<Ata> {
    const record = await this.prisma.ata.create({
      data: {
        id: ata.id,
        titulo: ata.titulo,
        conteudo: ata.conteudo,
        autorId: ata.autorId,
        dataReuniao: ata.dataReuniao,
        publicada: ata.publicada,
        criadoEm: ata.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  async update(ata: Ata): Promise<Ata> {
    const record = await this.prisma.ata.update({
      where: { id: ata.id },
      data: { publicada: ata.publicada },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaAta): Ata {
    return new Ata({
      id: record.id,
      titulo: record.titulo,
      conteudo: record.conteudo,
      autorId: record.autorId,
      dataReuniao: record.dataReuniao,
      publicada: record.publicada,
      criadoEm: record.criadoEm,
    })
  }
}
