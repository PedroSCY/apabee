import { Injectable } from '@nestjs/common'
import { MetaProducao as PrismaMetaProducao } from '@prisma/client'
import { IMetaProducaoRepository, MetaProducao } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaMetaProducaoRepository implements IMetaProducaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MetaProducao | null> {
    const r = await this.prisma.metaProducao.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string): Promise<MetaProducao[]> {
    const records = await this.prisma.metaProducao.findMany({
      where: { campanhaId },
      orderBy: { criadoEm: 'asc' },
    })
    return records.map(this.toDomain)
  }

  async findByCampanhaEProduto(campanhaId: string, produtoId: string): Promise<MetaProducao | null> {
    const r = await this.prisma.metaProducao.findUnique({
      where: { campanhaId_produtoId: { campanhaId, produtoId } },
    })
    return r ? this.toDomain(r) : null
  }

  async save(meta: MetaProducao): Promise<MetaProducao> {
    const r = await this.prisma.metaProducao.create({
      data: {
        id: meta.id,
        campanhaId: meta.campanhaId,
        produtoId: meta.produtoId,
        quantidadePlanejada: meta.quantidadePlanejada,
        perdaPercentualEstimada: meta.perdaPercentualEstimada,
        criadoEm: meta.criadoEm,
      },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.metaProducao.delete({ where: { id } })
  }

  private toDomain(r: PrismaMetaProducao): MetaProducao {
    return new MetaProducao({
      id: r.id,
      campanhaId: r.campanhaId,
      produtoId: r.produtoId,
      quantidadePlanejada: r.quantidadePlanejada,
      perdaPercentualEstimada: Number(r.perdaPercentualEstimada),
      criadoEm: r.criadoEm,
    })
  }
}
