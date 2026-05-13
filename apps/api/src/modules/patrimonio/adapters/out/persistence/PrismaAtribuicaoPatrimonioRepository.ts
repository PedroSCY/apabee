import { Injectable } from '@nestjs/common'
import { AtribuicaoPatrimonio as PrismaAtribuicao } from '@prisma/client'
import { AtribuicaoPatrimonio, IAtribuicaoPatrimonioRepository } from '@apa/core'
import { StatusAtribuicao, TipoPatrimonio } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaAtribuicaoPatrimonioRepository implements IAtribuicaoPatrimonioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AtribuicaoPatrimonio | null> {
    const record = await this.prisma.atribuicaoPatrimonio.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<AtribuicaoPatrimonio[]> {
    const records = await this.prisma.atribuicaoPatrimonio.findMany({
      orderBy: { dataInicio: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findByAssociado(associadoId: string): Promise<AtribuicaoPatrimonio[]> {
    const records = await this.prisma.atribuicaoPatrimonio.findMany({
      where: { associadoId },
      orderBy: { dataInicio: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findByAssociadoETipo(
    associadoId: string,
    tipo: TipoPatrimonio,
  ): Promise<AtribuicaoPatrimonio[]> {
    const records = await this.prisma.atribuicaoPatrimonio.findMany({
      where: { associadoId, tipoPatrimonio: tipo },
      orderBy: { dataInicio: 'desc' },
    })
    return records.map(this.toDomain)
  }

  async findAtivaByPatrimonio(
    patrimonioId: string,
    tipo: TipoPatrimonio,
  ): Promise<AtribuicaoPatrimonio | null> {
    const where =
      tipo === TipoPatrimonio.EQUIPAMENTO
        ? { equipamentoId: patrimonioId, status: StatusAtribuicao.ATIVO }
        : { insumoId: patrimonioId, status: StatusAtribuicao.ATIVO }

    const record = await this.prisma.atribuicaoPatrimonio.findFirst({ where })
    return record ? this.toDomain(record) : null
  }

  async save(atribuicao: AtribuicaoPatrimonio): Promise<AtribuicaoPatrimonio> {
    const isEquipamento = atribuicao.isEquipamento()
    const record = await this.prisma.atribuicaoPatrimonio.create({
      data: {
        id: atribuicao.id,
        tipoPatrimonio: atribuicao.isEquipamento()
          ? TipoPatrimonio.EQUIPAMENTO
          : TipoPatrimonio.INSUMO,
        equipamentoId: isEquipamento ? atribuicao.insumoId : null,
        insumoId: !isEquipamento ? atribuicao.insumoId : null,
        associadoId: atribuicao.associadoId,
        dataInicio: atribuicao.dataInicio,
        dataFim: atribuicao.dataFim,
        status: atribuicao.status,
        observacao: atribuicao.observacao,
      },
    })
    return this.toDomain(record)
  }

  async update(atribuicao: AtribuicaoPatrimonio): Promise<AtribuicaoPatrimonio> {
    const record = await this.prisma.atribuicaoPatrimonio.update({
      where: { id: atribuicao.id },
      data: {
        dataFim: atribuicao.dataFim,
        status: atribuicao.status,
        observacao: atribuicao.observacao,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaAtribuicao): AtribuicaoPatrimonio {
    const tipo = record.tipoPatrimonio as TipoPatrimonio
    const patrimonioId =
      tipo === TipoPatrimonio.EQUIPAMENTO
        ? (record.equipamentoId ?? '')
        : (record.insumoId ?? '')

    return new AtribuicaoPatrimonio({
      id: record.id,
      patrimonioId,
      tipoPatrimonio: tipo,
      associadoId: record.associadoId,
      dataInicio: record.dataInicio,
      dataFim: record.dataFim ?? undefined,
      status: record.status as StatusAtribuicao,
      observacao: record.observacao ?? undefined,
    })
  }
}
