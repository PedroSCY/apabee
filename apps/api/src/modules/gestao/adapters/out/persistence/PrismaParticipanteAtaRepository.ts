import { Injectable } from '@nestjs/common'
import { ParticipanteAta as PrismaParticipante } from '@prisma/client'
import { IParticipanteAtaRepository, ParticipanteAta } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaParticipanteAtaRepository implements IParticipanteAtaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAta(ataId: string): Promise<ParticipanteAta[]> {
    const records = await this.prisma.participanteAta.findMany({ where: { ataId } })
    return records.map((r) => this.toDomain(r))
  }

  async save(participante: ParticipanteAta): Promise<ParticipanteAta> {
    const record = await this.prisma.participanteAta.create({
      data: {
        id: participante.id,
        ataId: participante.ataId,
        associadoId: participante.associadoId,
      },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.participanteAta.delete({ where: { id } })
  }

  private toDomain(record: PrismaParticipante): ParticipanteAta {
    return new ParticipanteAta({
      id: record.id,
      ataId: record.ataId,
      associadoId: record.associadoId,
    })
  }
}
