import { Injectable } from '@nestjs/common'
import { Documento as PrismaDocumento } from '@prisma/client'
import { IDocumentoRepository, Documento } from '@apa/core'
import { CategoriaDocumento } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaDocumentoRepository implements IDocumentoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Documento | null> {
    const record = await this.prisma.documento.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<Documento[]> {
    const records = await this.prisma.documento.findMany({ orderBy: { criadoEm: 'desc' } })
    return records.map((r) => this.toDomain(r))
  }

  async findPublicados(): Promise<Documento[]> {
    const records = await this.prisma.documento.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findByCategoria(categoria: CategoriaDocumento): Promise<Documento[]> {
    const records = await this.prisma.documento.findMany({
      where: { categoria },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(documento: Documento): Promise<Documento> {
    const record = await this.prisma.documento.create({
      data: {
        id: documento.id,
        titulo: documento.titulo,
        categoria: documento.categoria,
        arquivoUrl: documento.arquivoUrl,
        tamanhoBytes: documento.tamanhoBytes,
        publicado: documento.publicado,
        autorId: documento.autorId,
        criadoEm: documento.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  async update(documento: Documento): Promise<Documento> {
    const record = await this.prisma.documento.update({
      where: { id: documento.id },
      data: { publicado: documento.publicado },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.documento.delete({ where: { id } })
  }

  private toDomain(record: PrismaDocumento): Documento {
    return new Documento({
      id: record.id,
      titulo: record.titulo,
      categoria: record.categoria as CategoriaDocumento,
      arquivoUrl: record.arquivoUrl,
      tamanhoBytes: record.tamanhoBytes,
      publicado: record.publicado,
      autorId: record.autorId,
      criadoEm: record.criadoEm,
    })
  }
}
