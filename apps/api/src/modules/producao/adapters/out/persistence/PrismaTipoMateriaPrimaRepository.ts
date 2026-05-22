import { Injectable } from '@nestjs/common'
import { TipoMateriaPrima as PrismaTipo } from '@prisma/client'
import { ITipoMateriaPrimaRepository, TipoMateriaPrima } from '@apa/core'
import { UnidadeMedida } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaTipoMateriaPrimaRepository implements ITipoMateriaPrimaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TipoMateriaPrima | null> {
    const record = await this.prisma.tipoMateriaPrima.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<TipoMateriaPrima[]> {
    const records = await this.prisma.tipoMateriaPrima.findMany({ orderBy: { nome: 'asc' } })
    return records.map(this.toDomain)
  }

  async save(tipo: TipoMateriaPrima): Promise<TipoMateriaPrima> {
    const record = await this.prisma.tipoMateriaPrima.create({
      data: {
        id: tipo.id,
        nome: tipo.nome,
        unidade: tipo.unidade,
        descricao: tipo.descricao,
      },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const estoque = await tx.estoqueMateriaPrima.findUnique({ where: { tipoMateriaPrimaId: id } })
      if (estoque) {
        await tx.movimentacaoEstoque.deleteMany({ where: { estoqueId: estoque.id } })
        await tx.estoqueMateriaPrima.delete({ where: { id: estoque.id } })
      }
      await tx.colheita.deleteMany({ where: { tipoMateriaPrimaId: id } })
      await tx.materialOrdemProducao.deleteMany({ where: { tipoMateriaPrimaId: id } })
      await tx.composicaoProduto.deleteMany({ where: { tipoMateriaPrimaId: id } })
      await tx.precoSafra.deleteMany({ where: { tipoMateriaPrimaId: id } })
      await tx.tipoMateriaPrima.delete({ where: { id } })
    })
  }

  private toDomain(record: PrismaTipo): TipoMateriaPrima {
    return new TipoMateriaPrima({
      id: record.id,
      nome: record.nome,
      unidade: record.unidade as UnidadeMedida,
      descricao: record.descricao ?? undefined,
    })
  }
}
