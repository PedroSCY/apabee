import { Injectable } from '@nestjs/common'
import { MovimentoFinanceiro } from '@apa/core'
import { IMovimentoFinanceiroRepository } from '@apa/core'
import { TipoMovimentoFinanceiro } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaMovimentoFinanceiroRepository implements IMovimentoFinanceiroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCampanha(campanhaId: string): Promise<MovimentoFinanceiro[]> {
    const rs = await this.prisma.movimentoFinanceiro.findMany({ where: { campanhaId }, orderBy: { data: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async findByAssociadoECampanha(associadoId: string, campanhaId: string): Promise<MovimentoFinanceiro[]> {
    const rs = await this.prisma.movimentoFinanceiro.findMany({ where: { associadoId, campanhaId } })
    return rs.map(r => this.toDomain(r))
  }

  async save(movimento: MovimentoFinanceiro): Promise<MovimentoFinanceiro> {
    const r = await this.prisma.movimentoFinanceiro.create({ data: this.toData(movimento) })
    return this.toDomain(r)
  }

  async saveMany(movimentos: MovimentoFinanceiro[]): Promise<MovimentoFinanceiro[]> {
    await this.prisma.movimentoFinanceiro.createMany({ data: movimentos.map(m => this.toData(m)) })
    return movimentos
  }

  private toData(m: MovimentoFinanceiro) {
    return {
      id: m.id,
      associadoId: m.associadoId,
      campanhaId: m.campanhaId ?? null,
      valor: m.valor,
      tipo: m.tipo,
      descricao: m.descricao ?? null,
      data: m.data,
    }
  }

  private toDomain(r: any): MovimentoFinanceiro {
    return new MovimentoFinanceiro({
      id: r.id,
      associadoId: r.associadoId,
      campanhaId: r.campanhaId ?? undefined,
      valor: Number(r.valor),
      tipo: r.tipo as TipoMovimentoFinanceiro,
      descricao: r.descricao ?? undefined,
      data: r.data,
    })
  }
}
