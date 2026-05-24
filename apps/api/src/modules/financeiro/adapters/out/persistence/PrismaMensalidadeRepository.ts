import { Injectable } from '@nestjs/common'
import { Mensalidade as PrismaMensalidade, MetodoPagamentoMensalidade as PrismaMetodo, StatusMensalidade as PrismaStatus } from '@prisma/client'
import { IMensalidadeRepository, Mensalidade } from '@apa/core'
import { MetodoPagamentoMensalidade, StatusMensalidade } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaMensalidadeRepository implements IMensalidadeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Mensalidade | null> {
    const record = await this.prisma.mensalidade.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByCobrancaGatewayId(gatewayId: string): Promise<Mensalidade | null> {
    const record = await this.prisma.mensalidade.findFirst({ where: { cobrancaGatewayId: gatewayId } })
    return record ? this.toDomain(record) : null
  }

  async findByAssociado(associadoId: string): Promise<Mensalidade[]> {
    const records = await this.prisma.mensalidade.findMany({
      where: { associadoId },
      orderBy: [{ competenciaAno: 'desc' }, { competenciaMes: 'desc' }],
    })
    return records.map(this.toDomain)
  }

  async findByCompetencia(ano: number, mes: number): Promise<Mensalidade[]> {
    const records = await this.prisma.mensalidade.findMany({
      where: { competenciaAno: ano, competenciaMes: mes },
      orderBy: { associadoId: 'asc' },
    })
    return records.map(this.toDomain)
  }

  async findByAssociadoECompetencia(associadoId: string, ano: number, mes: number): Promise<Mensalidade | null> {
    const record = await this.prisma.mensalidade.findUnique({
      where: { associadoId_competenciaAno_competenciaMes: { associadoId, competenciaAno: ano, competenciaMes: mes } },
    })
    return record ? this.toDomain(record) : null
  }

  async findByStatus(status: StatusMensalidade): Promise<Mensalidade[]> {
    const records = await this.prisma.mensalidade.findMany({
      where: { status: status as PrismaStatus },
      orderBy: [{ competenciaAno: 'desc' }, { competenciaMes: 'desc' }],
    })
    return records.map(this.toDomain)
  }

  async countPendentesByAssociado(associadoId: string): Promise<number> {
    return this.prisma.mensalidade.count({
      where: { associadoId, status: 'PENDENTE' },
    })
  }

  async save(mensalidade: Mensalidade): Promise<Mensalidade> {
    const record = await this.prisma.mensalidade.create({
      data: {
        id: mensalidade.id,
        associadoId: mensalidade.associadoId,
        competenciaAno: mensalidade.competenciaAno,
        competenciaMes: mensalidade.competenciaMes,
        valor: mensalidade.valor,
        status: mensalidade.status as PrismaStatus,
        metodoPagamento: mensalidade.metodoPagamento as PrismaMetodo | undefined ?? null,
        dataPagamento: mensalidade.dataPagamento ?? null,
        motivoIsencao: mensalidade.motivoIsencao ?? null,
        criadoEm: mensalidade.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  async saveMany(mensalidades: Mensalidade[]): Promise<Mensalidade[]> {
    return Promise.all(mensalidades.map((m) => this.save(m)))
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mensalidade.delete({ where: { id } })
  }

  async update(mensalidade: Mensalidade): Promise<Mensalidade> {
    const record = await this.prisma.mensalidade.update({
      where: { id: mensalidade.id },
      data: {
        status: mensalidade.status as PrismaStatus,
        metodoPagamento: mensalidade.metodoPagamento as PrismaMetodo | undefined ?? null,
        dataPagamento: mensalidade.dataPagamento ?? null,
        motivoIsencao: mensalidade.motivoIsencao ?? null,
        cobrancaGatewayId: mensalidade.cobrancaGatewayId ?? null,
        cobrancaLink: mensalidade.cobrancaLink ?? null,
        cobrancaStatus: mensalidade.cobrancaStatus ?? null,
        cobrancaPixCopiaECola: mensalidade.cobrancaPixCopiaECola ?? null,
        cobrancaValorCobrado: mensalidade.cobrancaValorCobrado ?? null,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaMensalidade): Mensalidade {
    return new Mensalidade({
      id: record.id,
      associadoId: record.associadoId,
      competenciaAno: record.competenciaAno,
      competenciaMes: record.competenciaMes,
      valor: Number(record.valor),
      status: record.status as StatusMensalidade,
      metodoPagamento: record.metodoPagamento as MetodoPagamentoMensalidade | undefined ?? undefined,
      dataPagamento: record.dataPagamento ?? undefined,
      motivoIsencao: record.motivoIsencao ?? undefined,
      criadoEm: record.criadoEm,
      cobrancaGatewayId: record.cobrancaGatewayId ?? undefined,
      cobrancaLink: record.cobrancaLink ?? undefined,
      cobrancaStatus: record.cobrancaStatus ?? undefined,
      cobrancaPixCopiaECola: record.cobrancaPixCopiaECola ?? undefined,
      cobrancaValorCobrado: record.cobrancaValorCobrado ? Number(record.cobrancaValorCobrado) : undefined,
    })
  }
}
