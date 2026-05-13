import { Injectable } from '@nestjs/common'
import { TipoInsumo as PrismaTipoInsumo } from '@prisma/client'
import { ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { CategoriaInsumo } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaTipoInsumoRepository implements ITipoInsumoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TipoInsumo | null> {
    const r = await this.prisma.tipoInsumo.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findBySigla(sigla: string): Promise<TipoInsumo | null> {
    const r = await this.prisma.tipoInsumo.findUnique({
      where: { sigla: sigla.toUpperCase() },
    })
    return r ? this.toDomain(r) : null
  }

  async findAll(): Promise<TipoInsumo[]> {
    const records = await this.prisma.tipoInsumo.findMany({ orderBy: { nome: 'asc' } })
    return records.map((r) => this.toDomain(r))
  }

  async save(tipo: TipoInsumo): Promise<TipoInsumo> {
    const r = await this.prisma.tipoInsumo.create({
      data: {
        id: tipo.id,
        nome: tipo.nome,
        descricao: tipo.descricao,
        categoria: tipo.categoria,
        sigla: tipo.sigla,
        criadoEm: tipo.criadoEm,
      },
    })
    return this.toDomain(r)
  }

  async update(tipo: TipoInsumo): Promise<TipoInsumo> {
    const r = await this.prisma.tipoInsumo.update({
      where: { id: tipo.id },
      data: { nome: tipo.nome, descricao: tipo.descricao, sigla: tipo.sigla },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tipoInsumo.delete({ where: { id } })
  }

  private toDomain(r: PrismaTipoInsumo): TipoInsumo {
    return new TipoInsumo({
      id: r.id,
      nome: r.nome,
      descricao: r.descricao ?? undefined,
      categoria: r.categoria as CategoriaInsumo,
      sigla: r.sigla,
      criadoEm: r.criadoEm,
    })
  }
}
