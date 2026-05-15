import { Injectable } from '@nestjs/common'
import { Campanha, ICampanhaRepository } from '@apa/core'
import { StatusCampanha, TipoLote } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaCampanhaRepository implements ICampanhaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Campanha | null> {
    const r = await this.prisma.campanha.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCodigo(codigo: string): Promise<Campanha | null> {
    const r = await this.prisma.campanha.findUnique({ where: { codigo } })
    return r ? this.toDomain(r) : null
  }

  async findAll(status?: StatusCampanha): Promise<Campanha[]> {
    const rs = await this.prisma.campanha.findMany({ where: status ? { status } : undefined, orderBy: { criadoEm: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async findVencidas(): Promise<Campanha[]> {
    const rs = await this.prisma.campanha.findMany({ where: { status: StatusCampanha.ATIVA, dataFim: { lte: new Date() } } })
    return rs.map(r => this.toDomain(r))
  }

  async save(campanha: Campanha): Promise<Campanha> {
    const r = await this.prisma.campanha.create({ data: this.toData(campanha) })
    return this.toDomain(r)
  }

  async update(campanha: Campanha): Promise<Campanha> {
    const r = await this.prisma.campanha.update({ where: { id: campanha.id }, data: this.toData(campanha) })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.campanha.delete({ where: { id } })
  }

  private toData(c: Campanha) {
    return {
      id: c.id, codigo: c.codigo, nome: c.nome, tipo: c.tipo, safraId: c.safraId ?? null,
      dataInicio: c.dataInicio, dataFim: c.dataFim ?? null, status: c.status,
      valorMeta: c.valorMeta ?? null, prazoContribuicao: c.prazoContribuicao ?? null,
      valorMinimo: c.valorMinimo ?? null, valorMaximo: c.valorMaximo ?? null,
      receitaTotal: c.receitaTotal, custoTotal: c.custoTotal, criadoEm: c.criadoEm,
    }
  }

  private toDomain(r: any): Campanha {
    return new Campanha({
      id: r.id, codigo: r.codigo, nome: r.nome, tipo: r.tipo as TipoLote,
      safraId: r.safraId ?? undefined, dataInicio: r.dataInicio, dataFim: r.dataFim ?? undefined,
      status: r.status as StatusCampanha, valorMeta: r.valorMeta ? Number(r.valorMeta) : undefined,
      prazoContribuicao: r.prazoContribuicao ?? undefined, valorMinimo: r.valorMinimo ? Number(r.valorMinimo) : undefined,
      valorMaximo: r.valorMaximo ? Number(r.valorMaximo) : undefined,
      receitaTotal: Number(r.receitaTotal), custoTotal: Number(r.custoTotal), criadoEm: r.criadoEm,
    })
  }
}
