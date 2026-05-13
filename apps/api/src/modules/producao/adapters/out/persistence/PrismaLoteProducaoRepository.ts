import { Injectable } from '@nestjs/common'
import { LoteProducao as PrismaLote } from '@prisma/client'
import { ILoteProducaoRepository, LoteProducao } from '@apa/core'
import { StatusLote, TipoLote } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaLoteProducaoRepository implements ILoteProducaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<LoteProducao | null> {
    const record = await this.prisma.loteProducao.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAtivos(): Promise<LoteProducao[]> {
    const records = await this.prisma.loteProducao.findMany({
      where: { status: StatusLote.ABERTO },
      orderBy: { dataInicio: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findAll(): Promise<LoteProducao[]> {
    const records = await this.prisma.loteProducao.findMany({ orderBy: { dataInicio: 'desc' } })
    return records.map(this.toDomain)
  }

  async findAbertosVencidos(): Promise<LoteProducao[]> {
    const records = await this.prisma.loteProducao.findMany({
      where: { status: StatusLote.ABERTO, dataFim: { lte: new Date() } },
    })
    return records.map(this.toDomain)
  }

  async save(lote: LoteProducao): Promise<LoteProducao> {
    const record = await this.prisma.loteProducao.create({
      data: {
        id: lote.id,
        tipo: lote.tipo,
        periodo: lote.periodo,
        dataInicio: lote.dataInicio,
        dataFim: lote.dataFim ?? null,
        status: lote.status,
        custoTotal: lote.custoTotal,
      },
    })
    return this.toDomain(record)
  }

  async update(lote: LoteProducao): Promise<LoteProducao> {
    const record = await this.prisma.loteProducao.update({
      where: { id: lote.id },
      data: {
        dataFim: lote.dataFim ?? null,
        status: lote.status,
        custoTotal: lote.custoTotal,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaLote): LoteProducao {
    return new LoteProducao({
      id: record.id,
      tipo: record.tipo as TipoLote,
      periodo: record.periodo,
      dataInicio: record.dataInicio,
      dataFim: record.dataFim ?? undefined,
      status: record.status as StatusLote,
      custoTotal: Number(record.custoTotal),
    })
  }
}
