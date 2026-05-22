import { Injectable } from '@nestjs/common'
import { IOrdemProducaoRepository, MaterialConsumido, OrdemProducao } from '@apa/core'
import { StatusOrdemProducao, UnidadeMedida } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaOrdemProducaoRepository implements IOrdemProducaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OrdemProducao | null> {
    const r = await this.prisma.ordemProducao.findUnique({ where: { id }, include: { materiaisConsumidos: true } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string, statuses?: string[]): Promise<OrdemProducao[]> {
    const rs = await this.prisma.ordemProducao.findMany({
      where: { campanhaId, ...(statuses ? { status: { in: statuses as any } } : {}) },
      include: { materiaisConsumidos: true },
      orderBy: { criadoEm: 'desc' },
    })
    return rs.map(r => this.toDomain(r))
  }

  async save(ordem: OrdemProducao): Promise<OrdemProducao> {
    const r = await this.prisma.ordemProducao.create({
      data: {
        id: ordem.id, campanhaId: ordem.campanhaId, produtoId: ordem.produtoId,
        quantidade: ordem.quantidade, status: ordem.status, perdaPercentual: ordem.perdaPercentual,
        produtosGerados: ordem.produtosGerados ?? null, criadoEm: ordem.criadoEm, executadoEm: ordem.executadoEm ?? null,
      },
      include: { materiaisConsumidos: true },
    })
    return this.toDomain(r)
  }

  async update(ordem: OrdemProducao): Promise<OrdemProducao> {
    // Remove materiais antigos e recria
    await this.prisma.materialOrdemProducao.deleteMany({ where: { ordemProducaoId: ordem.id } })
    const r = await this.prisma.ordemProducao.update({
      where: { id: ordem.id },
      data: {
        status: ordem.status, produtosGerados: ordem.produtosGerados ?? null, executadoEm: ordem.executadoEm ?? null,
        materiaisConsumidos: {
          create: ordem.materiaisConsumidos.map(m => ({
            id: crypto.randomUUID(),
            tipoMateriaPrimaId: m.tipoMateriaPrimaId,
            quantidade: m.quantidade,
            unidade: m.unidade,
          })),
        },
      },
      include: { materiaisConsumidos: true },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.materialOrdemProducao.deleteMany({ where: { ordemProducaoId: id } })
    await this.prisma.ordemProducao.delete({ where: { id } })
  }

  private toDomain(r: any): OrdemProducao {
    const materiais: MaterialConsumido[] = (r.materiaisConsumidos ?? []).map((m: any) => ({
      tipoMateriaPrimaId: m.tipoMateriaPrimaId,
      quantidade: Number(m.quantidade),
      unidade: m.unidade as UnidadeMedida,
    }))
    return new OrdemProducao({
      id: r.id, campanhaId: r.campanhaId, produtoId: r.produtoId, quantidade: r.quantidade,
      status: r.status as StatusOrdemProducao, perdaPercentual: Number(r.perdaPercentual),
      produtosGerados: r.produtosGerados ?? undefined, materiaisConsumidos: materiais,
      criadoEm: r.criadoEm, executadoEm: r.executadoEm ?? undefined,
    })
  }
}
