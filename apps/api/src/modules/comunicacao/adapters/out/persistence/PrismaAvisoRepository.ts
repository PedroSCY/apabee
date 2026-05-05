import { Injectable } from '@nestjs/common'
import { Aviso as PrismaAviso } from '@prisma/client'
import { Aviso, IAvisoRepository } from '@apa/core'
import { CategoriaAviso } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaAvisoRepository implements IAvisoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(apenasPublicados = false): Promise<Aviso[]> {
    const records = await this.prisma.aviso.findMany({
      where: apenasPublicados ? { publicado: true } : undefined,
      orderBy: [{ fixado: 'desc' }, { criadoEm: 'desc' }],
    })
    return records.map((r) => this.toDomain(r))
  }

  async findById(id: string): Promise<Aviso | null> {
    const r = await this.prisma.aviso.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async save(aviso: Aviso): Promise<Aviso> {
    const r = await this.prisma.aviso.create({
      data: {
        id: aviso.id,
        titulo: aviso.titulo,
        conteudo: aviso.conteudo,
        categoria: aviso.categoria,
        publicado: aviso.publicado,
        fixado: aviso.fixado,
        criadoEm: aviso.criadoEm,
      },
    })
    return this.toDomain(r)
  }

  async update(aviso: Aviso): Promise<Aviso> {
    const r = await this.prisma.aviso.update({
      where: { id: aviso.id },
      data: {
        titulo: aviso.titulo,
        conteudo: aviso.conteudo,
        categoria: aviso.categoria,
        publicado: aviso.publicado,
        fixado: aviso.fixado,
      },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.aviso.delete({ where: { id } })
  }

  private toDomain(r: PrismaAviso): Aviso {
    return new Aviso({
      id: r.id,
      titulo: r.titulo,
      conteudo: r.conteudo,
      categoria: r.categoria as CategoriaAviso,
      publicado: r.publicado,
      fixado: r.fixado,
      criadoEm: r.criadoEm,
    })
  }
}
