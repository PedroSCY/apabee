import { Injectable } from '@nestjs/common'
import { Insumo as PrismaInsumo, TipoInsumo as PrismaTipoInsumo } from '@prisma/client'
import { IInsumoRepository, Insumo, TipoInsumo } from '@apa/core'
import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

type InsumoWithTipo = PrismaInsumo & { tipoInsumo: PrismaTipoInsumo }

@Injectable()
export class PrismaInsumoRepository implements IInsumoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Insumo | null> {
    const r = await this.prisma.insumo.findUnique({
      where: { id },
      include: { tipoInsumo: true },
    })
    return r ? this.toDomain(r) : null
  }

  async findAll(tipoInsumoId?: string): Promise<Insumo[]> {
    const records = await this.prisma.insumo.findMany({
      where: tipoInsumoId ? { tipoInsumoId } : undefined,
      include: { tipoInsumo: true },
      orderBy: { identificador: 'asc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findAvailableByTipo(tipoInsumoId: string, limit: number): Promise<Insumo[]> {
    const records = await this.prisma.insumo.findMany({
      where: { tipoInsumoId, status: 'DISPONIVEL' },
      include: { tipoInsumo: true },
      orderBy: { identificador: 'asc' },
      take: limit,
    })
    return records.map((r) => this.toDomain(r))
  }

  async maxSequenceByTipo(tipoInsumoId: string): Promise<number> {
    const records = await this.prisma.insumo.findMany({
      where: { tipoInsumoId },
      select: { identificador: true },
    })
    return records.reduce((max, { identificador }) => {
      const num = parseInt(identificador.split('-').at(-1) ?? '0', 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 0)
  }

  async save(insumo: Insumo): Promise<Insumo> {
    const r = await this.prisma.insumo.create({
      data: {
        id: insumo.id,
        identificador: insumo.identificador,
        tipoInsumoId: insumo.tipoInsumoId,
        descricao: insumo.descricao,
        status: insumo.status,
        criadoEm: insumo.criadoEm,
      },
      include: { tipoInsumo: true },
    })
    return this.toDomain(r)
  }

  async saveMany(insumos: Insumo[]): Promise<Insumo[]> {
    return Promise.all(insumos.map((i) => this.save(i)))
  }

  async update(insumo: Insumo): Promise<Insumo> {
    const r = await this.prisma.insumo.update({
      where: { id: insumo.id },
      data: { descricao: insumo.descricao, status: insumo.status },
      include: { tipoInsumo: true },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.insumo.delete({ where: { id } })
  }

  private toDomain(r: InsumoWithTipo): Insumo {
    const tipoInsumo = new TipoInsumo({
      id: r.tipoInsumo.id,
      nome: r.tipoInsumo.nome,
      descricao: r.tipoInsumo.descricao ?? undefined,
      categoria: r.tipoInsumo.categoria as CategoriaInsumo,
      sigla: r.tipoInsumo.sigla,
      criadoEm: r.tipoInsumo.criadoEm,
    })
    return new Insumo({
      id: r.id,
      identificador: r.identificador,
      tipoInsumoId: r.tipoInsumoId,
      tipoInsumo,
      descricao: r.descricao ?? undefined,
      status: r.status as StatusPatrimonio,
      criadoEm: r.criadoEm,
    })
  }
}
