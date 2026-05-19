import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { Colheita as PrismaColheita } from '@prisma/client'
import { Colheita, IColheitaRepository } from '@apa/core'
import { UnidadeMedida } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaColheitaRepository implements IColheitaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Colheita[]> {
    const records = await this.prisma.colheita.findMany({
      orderBy: { dataColheita: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findById(id: string): Promise<Colheita | null> {
    const record = await this.prisma.colheita.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByAssociado(associadoId: string): Promise<Colheita[]> {
    const records = await this.prisma.colheita.findMany({
      where: { associadoId },
      orderBy: { dataColheita: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findByCampanha(campanhaId: string): Promise<Colheita[]> {
    const records = await this.prisma.colheita.findMany({
      where: { campanhaId },
      orderBy: { dataColheita: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async delete(id: string): Promise<void> {
    const colheita = await this.prisma.colheita.findUnique({ where: { id } })
    if (!colheita) throw new NotFoundException('Colheita não encontrada.')

    const estoque = await this.prisma.estoqueMateriaPrima.findUnique({
      where: { tipoMateriaPrimaId: colheita.tipoMateriaPrimaId },
    })

    if (estoque) {
      const saidas = await this.prisma.movimentacaoEstoque.count({
        where: { estoqueId: estoque.id, tipo: 'SAIDA' },
      })
      if (saidas > 0) {
        throw new ConflictException(
          'Esta colheita não pode ser excluída pois a matéria-prima já foi consumida em uma ordem de produção.',
        )
      }

      // Remove o movimento de entrada desta colheita e subtrai do saldo
      await this.prisma.movimentacaoEstoque.deleteMany({
        where: { estoqueId: estoque.id, referenciaId: id },
      })
      await this.prisma.estoqueMateriaPrima.update({
        where: { id: estoque.id },
        data: { quantidadeDisponivel: { decrement: colheita.volume } },
      })
    }

    await this.prisma.colheita.delete({ where: { id } })
  }

  async save(colheita: Colheita): Promise<Colheita> {
    const record = await this.prisma.colheita.create({
      data: {
        id: colheita.id,
        associadoId: colheita.associadoId,
        tipoMateriaPrimaId: colheita.tipoMateriaPrimaId,
        equipamentoId: colheita.equipamentoId ?? null,
        campanhaId: colheita.campanhaId ?? null,
        safraId: colheita.safraId ?? null,
        volume: colheita.volume,
        unidade: colheita.unidade,
        dataColheita: colheita.dataColheita,
        observacao: colheita.observacao ?? null,
        criadoEm: colheita.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaColheita): Colheita {
    return new Colheita({
      id: record.id,
      associadoId: record.associadoId,
      tipoMateriaPrimaId: record.tipoMateriaPrimaId,
      equipamentoId: record.equipamentoId ?? undefined,
      campanhaId: record.campanhaId ?? undefined,
      safraId: record.safraId ?? undefined,
      volume: Number(record.volume),
      unidade: record.unidade as UnidadeMedida,
      dataColheita: record.dataColheita,
      observacao: record.observacao ?? undefined,
      criadoEm: record.criadoEm,
    })
  }
}
