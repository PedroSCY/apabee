import { Injectable } from '@nestjs/common'
import { Equipamento as PrismaEquipamento } from '@prisma/client'
import { Equipamento, IEquipamentoRepository } from '@apa/core'
import { StatusPatrimonio } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaEquipamentoRepository implements IEquipamentoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Equipamento | null> {
    const record = await this.prisma.equipamento.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<Equipamento[]> {
    const records = await this.prisma.equipamento.findMany({
      orderBy: { criadoEm: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findDisponiveis(): Promise<Equipamento[]> {
    const records = await this.prisma.equipamento.findMany({
      where: { status: StatusPatrimonio.DISPONIVEL },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async save(equipamento: Equipamento): Promise<Equipamento> {
    const record = await this.prisma.equipamento.create({
      data: {
        id: equipamento.id,
        nome: equipamento.nome,
        numeroSerie: equipamento.numeroSerie,
        descricao: equipamento.descricao,
        status: equipamento.status,
        criadoEm: equipamento.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  async update(equipamento: Equipamento): Promise<Equipamento> {
    const record = await this.prisma.equipamento.update({
      where: { id: equipamento.id },
      data: {
        nome: equipamento.nome,
        numeroSerie: equipamento.numeroSerie,
        descricao: equipamento.descricao,
        status: equipamento.status,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaEquipamento): Equipamento {
    return new Equipamento({
      id: record.id,
      nome: record.nome,
      numeroSerie: record.numeroSerie ?? undefined,
      descricao: record.descricao ?? undefined,
      status: record.status as StatusPatrimonio,
      criadoEm: record.criadoEm,
    })
  }
}
