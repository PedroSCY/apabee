import { Injectable } from '@nestjs/common'
import { Prisma, TipoNotificacao as PrismaTipo } from '@prisma/client'
import { Notificacao, INotificacaoRepository, CriarNotificacaoInput } from '@apa/core'
import { TipoNotificacao } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaNotificacaoRepository implements INotificacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(input: CriarNotificacaoInput): Promise<Notificacao> {
    const record = await this.prisma.notificacao.create({
      data: {
        userId: input.userId,
        tipo: input.tipo as PrismaTipo,
        titulo: input.titulo,
        corpo: input.corpo,
        dadosExtras: input.dadosExtras ? (input.dadosExtras as Prisma.InputJsonValue) : undefined,
      },
    })
    return this.toDomain(record)
  }

  async criarEmLote(inputs: CriarNotificacaoInput[]): Promise<void> {
    await this.prisma.notificacao.createMany({
      data: inputs.map(i => ({
        userId: i.userId,
        tipo: i.tipo as PrismaTipo,
        titulo: i.titulo,
        corpo: i.corpo,
        dadosExtras: i.dadosExtras ? (i.dadosExtras as Prisma.InputJsonValue) : Prisma.JsonNull,
      })),
    })
  }

  async listarPorUsuario(userId: string, limit = 50): Promise<Notificacao[]> {
    const records = await this.prisma.notificacao.findMany({
      where: { userId },
      orderBy: { criadoEm: 'desc' },
      take: limit,
    })
    return records.map(r => this.toDomain(r))
  }

  async contarNaoLidas(userId: string): Promise<number> {
    return this.prisma.notificacao.count({ where: { userId, lida: false } })
  }

  async marcarLida(id: string, userId: string): Promise<Notificacao | null> {
    const existing = await this.prisma.notificacao.findFirst({ where: { id, userId } })
    if (!existing) return null
    const record = await this.prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    })
    return this.toDomain(record)
  }

  async marcarTodasLidas(userId: string): Promise<void> {
    await this.prisma.notificacao.updateMany({
      where: { userId, lida: false },
      data: { lida: true },
    })
  }

  private toDomain(record: { id: string; userId: string; tipo: PrismaTipo; titulo: string; corpo: string | null; dadosExtras: unknown; lida: boolean; criadoEm: Date }): Notificacao {
    return new Notificacao({
      id: record.id,
      userId: record.userId,
      tipo: record.tipo as TipoNotificacao,
      titulo: record.titulo,
      corpo: record.corpo ?? undefined,
      dadosExtras: record.dadosExtras as Record<string, unknown> | undefined,
      lida: record.lida,
      criadoEm: record.criadoEm,
    })
  }
}
