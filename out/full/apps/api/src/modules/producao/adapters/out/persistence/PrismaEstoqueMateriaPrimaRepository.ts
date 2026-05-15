import { Injectable } from '@nestjs/common'
import {
  EstoqueMateriaPrima as PrismaEstoque,
  MovimentacaoEstoque as PrismaMovimentacao,
} from '@prisma/client'
import {
  EstoqueMateriaPrima,
  IEstoqueMateriaPrimaRepository,
  MovimentacaoEstoque,
} from '@apa/core'
import { TipoMovimentacao, UnidadeMedida } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaEstoqueMateriaPrimaRepository implements IEstoqueMateriaPrimaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EstoqueMateriaPrima[]> {
    const records = await this.prisma.estoqueMateriaPrima.findMany()
    return records.map(this.toDomain)
  }

  async findByTipo(tipoMateriaPrimaId: string): Promise<EstoqueMateriaPrima | null> {
    const record = await this.prisma.estoqueMateriaPrima.findUnique({ where: { tipoMateriaPrimaId } })
    return record ? this.toDomain(record) : null
  }

  async save(estoque: EstoqueMateriaPrima): Promise<EstoqueMateriaPrima> {
    const record = await this.prisma.estoqueMateriaPrima.create({
      data: {
        id: estoque.id,
        tipoMateriaPrimaId: estoque.tipoMateriaPrimaId,
        quantidadeDisponivel: estoque.quantidadeDisponivel,
        unidade: estoque.unidade,
      },
    })
    return this.toDomain(record)
  }

  async update(estoque: EstoqueMateriaPrima): Promise<EstoqueMateriaPrima> {
    const record = await this.prisma.estoqueMateriaPrima.update({
      where: { id: estoque.id },
      data: { quantidadeDisponivel: estoque.quantidadeDisponivel },
    })
    return this.toDomain(record)
  }

  async salvarMovimentacao(mov: MovimentacaoEstoque): Promise<MovimentacaoEstoque> {
    const record = await this.prisma.movimentacaoEstoque.create({
      data: {
        id: mov.id,
        estoqueId: mov.estoqueId,
        tipo: mov.tipo,
        quantidade: mov.quantidade,
        referenciaId: mov.referenciaId ?? '',
        criadoEm: mov.criadoEm,
      },
    })
    return this.toMovDomain(record)
  }

  async findMovimentacoesByEstoque(estoqueId: string): Promise<MovimentacaoEstoque[]> {
    const records = await this.prisma.movimentacaoEstoque.findMany({
      where: { estoqueId },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map(this.toMovDomain)
  }

  private toDomain(record: PrismaEstoque): EstoqueMateriaPrima {
    return new EstoqueMateriaPrima({
      id: record.id,
      tipoMateriaPrimaId: record.tipoMateriaPrimaId,
      quantidadeDisponivel: Number(record.quantidadeDisponivel),
      unidade: record.unidade as UnidadeMedida,
      atualizadoEm: record.atualizadoEm,
    })
  }

  private toMovDomain(record: PrismaMovimentacao): MovimentacaoEstoque {
    return new MovimentacaoEstoque({
      id: record.id,
      estoqueId: record.estoqueId,
      tipo: record.tipo as TipoMovimentacao,
      quantidade: Number(record.quantidade),
      referenciaId: record.referenciaId,
      criadoEm: record.criadoEm,
    })
  }
}
