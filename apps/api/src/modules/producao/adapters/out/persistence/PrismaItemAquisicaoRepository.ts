import { Injectable } from '@nestjs/common'
import { ItemAquisicao, IItemAquisicaoRepository } from '@apa/core'
import { TipoDestinoAquisicao } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaItemAquisicaoRepository implements IItemAquisicaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ItemAquisicao | null> {
    const r = await this.prisma.itemAquisicao.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string): Promise<ItemAquisicao[]> {
    const rs = await this.prisma.itemAquisicao.findMany({ where: { campanhaId }, orderBy: { criadoEm: 'asc' } })
    return rs.map(r => this.toDomain(r))
  }

  async save(item: ItemAquisicao): Promise<ItemAquisicao> {
    const r = await this.prisma.itemAquisicao.create({
      data: {
        id: item.id,
        campanhaId: item.campanhaId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorEstimado: item.valorEstimado,
        tipoDestino: item.tipoDestino,
        equipamentoNome: item.equipamentoNome ?? null,
        tipoMateriaPrimaId: item.tipoMateriaPrimaId ?? null,
        criadoEm: item.criadoEm,
      },
    })
    return this.toDomain(r)
  }

  async update(item: ItemAquisicao): Promise<ItemAquisicao> {
    const r = await this.prisma.itemAquisicao.update({
      where: { id: item.id },
      data: {
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorEstimado: item.valorEstimado,
        tipoDestino: item.tipoDestino,
        equipamentoNome: item.equipamentoNome ?? null,
        tipoMateriaPrimaId: item.tipoMateriaPrimaId ?? null,
      },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.itemAquisicao.delete({ where: { id } })
  }

  private toDomain(r: any): ItemAquisicao {
    return new ItemAquisicao({
      id: r.id,
      campanhaId: r.campanhaId,
      descricao: r.descricao,
      quantidade: r.quantidade,
      valorEstimado: Number(r.valorEstimado),
      tipoDestino: r.tipoDestino as TipoDestinoAquisicao,
      equipamentoNome: r.equipamentoNome ?? undefined,
      tipoMateriaPrimaId: r.tipoMateriaPrimaId ?? undefined,
      criadoEm: r.criadoEm,
    })
  }
}
