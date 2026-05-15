import { Injectable } from '@nestjs/common'
import { TipoMateriaPrima as PrismaTipo } from '@prisma/client'
import { ITipoMateriaPrimaRepository, TipoMateriaPrima } from '@apa/core'
import { UnidadeMedida } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaTipoMateriaPrimaRepository implements ITipoMateriaPrimaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TipoMateriaPrima | null> {
    const record = await this.prisma.tipoMateriaPrima.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<TipoMateriaPrima[]> {
    const records = await this.prisma.tipoMateriaPrima.findMany({ orderBy: { nome: 'asc' } })
    return records.map(this.toDomain)
  }

  async save(tipo: TipoMateriaPrima): Promise<TipoMateriaPrima> {
    const record = await this.prisma.tipoMateriaPrima.create({
      data: {
        id: tipo.id,
        nome: tipo.nome,
        unidade: tipo.unidade,
        descricao: tipo.descricao,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaTipo): TipoMateriaPrima {
    return new TipoMateriaPrima({
      id: record.id,
      nome: record.nome,
      unidade: record.unidade as UnidadeMedida,
      descricao: record.descricao ?? undefined,
    })
  }
}
