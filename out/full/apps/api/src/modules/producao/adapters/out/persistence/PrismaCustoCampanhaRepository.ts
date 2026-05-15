import { Injectable } from '@nestjs/common'
import { CustoCampanha, ICustoCampanhaRepository } from '@apa/core'
import { CategoriaCusto } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaCustoCampanhaRepository implements ICustoCampanhaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CustoCampanha | null> {
    const r = await this.prisma.custoCampanha.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string): Promise<CustoCampanha[]> {
    const rs = await this.prisma.custoCampanha.findMany({ where: { campanhaId }, orderBy: { criadoEm: 'desc' } })
    return rs.map(r => this.toDomain(r))
  }

  async sumByCampanha(campanhaId: string): Promise<number> {
    const result = await this.prisma.custoCampanha.aggregate({ where: { campanhaId }, _sum: { valor: true } })
    return Number(result._sum.valor ?? 0)
  }

  async save(custo: CustoCampanha): Promise<CustoCampanha> {
    const r = await this.prisma.custoCampanha.create({
      data: {
        id: custo.id, campanhaId: custo.campanhaId, descricao: custo.descricao,
        valor: custo.valor, categoria: custo.categoria, pagoPorId: custo.pagoPorId ?? null,
        comprovanteUrl: custo.comprovanteUrl ?? null, criadoEm: custo.criadoEm,
      },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.custoCampanha.delete({ where: { id } })
  }

  private toDomain(r: any): CustoCampanha {
    return new CustoCampanha({
      id: r.id, campanhaId: r.campanhaId, descricao: r.descricao, valor: Number(r.valor),
      categoria: r.categoria as CategoriaCusto, pagoPorId: r.pagoPorId ?? undefined,
      comprovanteUrl: r.comprovanteUrl ?? undefined, criadoEm: r.criadoEm,
    })
  }
}
