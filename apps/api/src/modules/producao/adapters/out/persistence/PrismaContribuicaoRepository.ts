import { Injectable } from '@nestjs/common'
import { Contribuicao, IContribuicaoRepository } from '@apa/core'
import { TipoContribuicao } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaContribuicaoRepository implements IContribuicaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Contribuicao | null> {
    const r = await this.prisma.contribuicao.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string): Promise<Contribuicao[]> {
    const rs = await this.prisma.contribuicao.findMany({ where: { campanhaId }, orderBy: { criadoEm: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async findByAssociado(associadoId: string): Promise<Contribuicao[]> {
    const rs = await this.prisma.contribuicao.findMany({ where: { associadoId }, orderBy: { criadoEm: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async findByCampanhaEAssociado(campanhaId: string, associadoId: string): Promise<Contribuicao[]> {
    const rs = await this.prisma.contribuicao.findMany({ where: { campanhaId, associadoId } })
    return rs.map(r => this.toDomain(r))
  }

  async sumByCampanha(campanhaId: string): Promise<{ associadoId: string | null; total: number }[]> {
    const groups = await this.prisma.contribuicao.groupBy({
      by: ['associadoId'],
      where: { campanhaId },
      _sum: { valorMonetario: true },
    })
    return groups.map(g => ({ associadoId: g.associadoId ?? null, total: Number(g._sum.valorMonetario ?? 0) }))
  }

  async save(c: Contribuicao): Promise<Contribuicao> {
    const r = await this.prisma.contribuicao.create({ data: this.toData(c) })
    return this.toDomain(r)
  }

  async update(c: Contribuicao): Promise<Contribuicao> {
    const r = await this.prisma.contribuicao.update({ where: { id: c.id }, data: this.toData(c) })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contribuicao.delete({ where: { id } })
  }

  private toData(c: Contribuicao) {
    return {
      id: c.id, campanhaId: c.campanhaId, associadoId: c.associadoId, tipo: c.tipo,
      valorMonetario: c.valorMonetario, colheitaId: c.colheitaId ?? null, volume: c.volume ?? null,
      tipoMateriaPrimaId: c.tipoMateriaPrimaId ?? null,
      descricao: c.descricao ?? null, liquidado: c.liquidado, criadoEm: c.criadoEm,
    }
  }

  private toDomain(r: any): Contribuicao {
    return new Contribuicao({
      id: r.id, campanhaId: r.campanhaId, associadoId: r.associadoId,
      tipo: r.tipo as TipoContribuicao, valorMonetario: Number(r.valorMonetario),
      colheitaId: r.colheitaId ?? undefined, volume: r.volume ? Number(r.volume) : undefined,
      tipoMateriaPrimaId: r.tipoMateriaPrimaId ?? undefined,
      descricao: r.descricao ?? undefined, liquidado: r.liquidado, criadoEm: r.criadoEm,
    })
  }
}
