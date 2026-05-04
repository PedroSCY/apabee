import { Injectable } from '@nestjs/common'
import { Colheita as PrismaColheita } from '@prisma/client'
import { Colheita, IColheitaRepository } from '@apa/core'
import { UnidadeMedida } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaColheitaRepository implements IColheitaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Colheita | null> {
    const record = await this.prisma.colheita.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByAssociado(associadoId: string): Promise<Colheita[]> {
    const records = await this.prisma.colheita.findMany({
      where: { associadoId },
      orderBy: { dataColheita: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findByLote(loteId: string): Promise<Colheita[]> {
    const records = await this.prisma.colheita.findMany({
      where: { loteProducaoId: loteId },
      orderBy: { dataColheita: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async save(colheita: Colheita): Promise<Colheita> {
    const record = await this.prisma.colheita.create({
      data: {
        id: colheita.id,
        associadoId: colheita.associadoId,
        tipoMateriaPrimaId: colheita.tipoMateriaPrimaId,
        equipamentoId: colheita.equipamentoId ?? null,
        loteProducaoId: colheita.loteProducaoId,
        volume: colheita.volume,
        unidade: colheita.unidade,
        dataColheita: colheita.dataColheita,
        observacao: colheita.observacao ?? null,
        criadoEm: colheita.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaColheita): Colheita {
    return new Colheita({
      id: record.id,
      associadoId: record.associadoId,
      tipoMateriaPrimaId: record.tipoMateriaPrimaId,
      equipamentoId: record.equipamentoId ?? undefined,
      loteProducaoId: record.loteProducaoId,
      volume: Number(record.volume),
      unidade: record.unidade as UnidadeMedida,
      dataColheita: record.dataColheita,
      observacao: record.observacao ?? undefined,
      criadoEm: record.criadoEm,
    })
  }
}
