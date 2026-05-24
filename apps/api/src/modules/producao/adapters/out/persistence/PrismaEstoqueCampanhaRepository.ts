import { Injectable } from '@nestjs/common'
import {
  EstoqueCampanha as PrismaEstoqueCampanha,
  MovimentacaoEstoqueCampanha as PrismaMovimentacaoCampanha,
} from '@prisma/client'
import {
  EstoqueCampanha,
  IEstoqueCampanhaRepository,
  MovimentacaoEstoqueCampanha,
} from '@apa/core'
import { TipoMovimentacao, UnidadeMedida } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaEstoqueCampanhaRepository implements IEstoqueCampanhaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCampanha(campanhaId: string): Promise<EstoqueCampanha[]> {
    const records = await this.prisma.estoqueCampanha.findMany({ where: { campanhaId } })
    return records.map(this.toDomain)
  }

  async findByCampanhaETipo(campanhaId: string, tipoMateriaPrimaId: string): Promise<EstoqueCampanha | null> {
    const record = await this.prisma.estoqueCampanha.findUnique({
      where: { campanhaId_tipoMateriaPrimaId: { campanhaId, tipoMateriaPrimaId } },
    })
    return record ? this.toDomain(record) : null
  }

  async save(estoque: EstoqueCampanha): Promise<EstoqueCampanha> {
    const record = await this.prisma.estoqueCampanha.create({
      data: {
        id: estoque.id,
        campanhaId: estoque.campanhaId,
        tipoMateriaPrimaId: estoque.tipoMateriaPrimaId,
        quantidadeDisponivel: estoque.quantidadeDisponivel,
        unidade: estoque.unidade,
      },
    })
    return this.toDomain(record)
  }

  async update(estoque: EstoqueCampanha): Promise<EstoqueCampanha> {
    const record = await this.prisma.estoqueCampanha.update({
      where: { id: estoque.id },
      data: { quantidadeDisponivel: estoque.quantidadeDisponivel },
    })
    return this.toDomain(record)
  }

  async salvarMovimentacao(mov: MovimentacaoEstoqueCampanha): Promise<MovimentacaoEstoqueCampanha> {
    const record = await this.prisma.movimentacaoEstoqueCampanha.create({
      data: {
        id: mov.id,
        estoqueCampanhaId: mov.estoqueCampanhaId,
        tipo: mov.tipo,
        quantidade: mov.quantidade,
        referenciaId: mov.referenciaId,
        criadoEm: mov.criadoEm,
      },
    })
    return this.toMovDomain(record)
  }

  async countSaidas(estoqueCampanhaId: string): Promise<number> {
    return this.prisma.movimentacaoEstoqueCampanha.count({
      where: { estoqueCampanhaId, tipo: 'SAIDA' },
    })
  }

  async findMovimentacoes(estoqueCampanhaId: string): Promise<MovimentacaoEstoqueCampanha[]> {
    const records = await this.prisma.movimentacaoEstoqueCampanha.findMany({
      where: { estoqueCampanhaId },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map(this.toMovDomain)
  }

  private toDomain(record: PrismaEstoqueCampanha): EstoqueCampanha {
    return new EstoqueCampanha({
      id: record.id,
      campanhaId: record.campanhaId,
      tipoMateriaPrimaId: record.tipoMateriaPrimaId,
      quantidadeDisponivel: Number(record.quantidadeDisponivel),
      unidade: record.unidade as UnidadeMedida,
      atualizadoEm: record.atualizadoEm,
    })
  }

  private toMovDomain(record: PrismaMovimentacaoCampanha): MovimentacaoEstoqueCampanha {
    return new MovimentacaoEstoqueCampanha({
      id: record.id,
      estoqueCampanhaId: record.estoqueCampanhaId,
      tipo: record.tipo as TipoMovimentacao,
      quantidade: Number(record.quantidade),
      referenciaId: record.referenciaId ?? undefined,
      criadoEm: record.criadoEm,
    })
  }
}
