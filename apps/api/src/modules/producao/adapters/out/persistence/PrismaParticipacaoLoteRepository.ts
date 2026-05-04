import { Injectable } from '@nestjs/common'
import { ParticipacaoLote as PrismaParticipacao } from '@prisma/client'
import { IParticipacaoLoteRepository, ParticipacaoLote } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaParticipacaoLoteRepository implements IParticipacaoLoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLote(loteId: string): Promise<ParticipacaoLote[]> {
    const records = await this.prisma.participacaoLote.findMany({
      where: { loteProducaoId: loteId },
    })
    return records.map(this.toDomain)
  }

  async findByAssociadoELote(associadoId: string, loteId: string): Promise<ParticipacaoLote | null> {
    const record = await this.prisma.participacaoLote.findUnique({
      where: { loteProducaoId_associadoId: { loteProducaoId: loteId, associadoId } },
    })
    return record ? this.toDomain(record) : null
  }

  async save(participacao: ParticipacaoLote): Promise<ParticipacaoLote> {
    const record = await this.prisma.participacaoLote.create({
      data: {
        id: participacao.id,
        loteProducaoId: participacao.loteProducaoId,
        associadoId: participacao.associadoId,
        percentual: participacao.percentual,
        volume: participacao.volume ?? null,
        valorInvestido: participacao.valorInvestido ?? null,
      },
    })
    return this.toDomain(record)
  }

  async update(participacao: ParticipacaoLote): Promise<ParticipacaoLote> {
    const record = await this.prisma.participacaoLote.update({
      where: { loteProducaoId_associadoId: { loteProducaoId: participacao.loteProducaoId, associadoId: participacao.associadoId } },
      data: {
        percentual: participacao.percentual,
        volume: participacao.volume ?? null,
        valorInvestido: participacao.valorInvestido ?? null,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaParticipacao): ParticipacaoLote {
    return new ParticipacaoLote({
      id: record.id,
      loteProducaoId: record.loteProducaoId,
      associadoId: record.associadoId,
      percentual: Number(record.percentual),
      volume: record.volume != null ? Number(record.volume) : undefined,
      valorInvestido: record.valorInvestido != null ? Number(record.valorInvestido) : undefined,
    })
  }
}
