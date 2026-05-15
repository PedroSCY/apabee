import { Injectable } from '@nestjs/common'
import { IPrecoSafraRepository, PrecoSafra } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaPrecoSafraRepository implements IPrecoSafraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTipoESafra(tipoMateriaPrimaId: string, safraId: string): Promise<PrecoSafra | null> {
    const r = await this.prisma.precoSafra.findUnique({ where: { tipoMateriaPrimaId_safraId: { tipoMateriaPrimaId, safraId } } })
    return r ? this.toDomain(r) : null
  }

  async findBySafra(safraId: string): Promise<PrecoSafra[]> {
    const rs = await this.prisma.precoSafra.findMany({ where: { safraId } })
    return rs.map(r => this.toDomain(r))
  }

  async save(preco: PrecoSafra): Promise<PrecoSafra> {
    const r = await this.prisma.precoSafra.create({
      data: { id: preco.id, tipoMateriaPrimaId: preco.tipoMateriaPrimaId, safraId: preco.safraId, preco: preco.preco },
    })
    return this.toDomain(r)
  }

  async update(preco: PrecoSafra): Promise<PrecoSafra> {
    const r = await this.prisma.precoSafra.update({ where: { id: preco.id }, data: { preco: preco.preco } })
    return this.toDomain(r)
  }

  private toDomain(r: any): PrecoSafra {
    return new PrecoSafra({ id: r.id, tipoMateriaPrimaId: r.tipoMateriaPrimaId, safraId: r.safraId, preco: Number(r.preco) })
  }
}
