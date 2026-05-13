import { Injectable } from '@nestjs/common'
import { SolicitacaoPatrimonio as PrismaSolicitacao } from '@prisma/client'
import { ISolicitacaoPatrimonioRepository, SolicitacaoPatrimonio } from '@apa/core'
import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaSolicitacaoPatrimonioRepository implements ISolicitacaoPatrimonioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SolicitacaoPatrimonio | null> {
    const r = await this.prisma.solicitacaoPatrimonio.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findAll(status?: StatusSolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio[]> {
    const records = await this.prisma.solicitacaoPatrimonio.findMany({
      where: status ? { status } : undefined,
      orderBy: { criadoEm: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findByAssociado(associadoId: string): Promise<SolicitacaoPatrimonio[]> {
    const records = await this.prisma.solicitacaoPatrimonio.findMany({
      where: { associadoId },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(s: SolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio> {
    const isEquipamento = s.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO
    const r = await this.prisma.solicitacaoPatrimonio.create({
      data: {
        id: s.id,
        tipoPatrimonio: s.tipoPatrimonio,
        equipamentoId: isEquipamento ? s.patrimonioId : null,
        insumoId: !isEquipamento ? s.patrimonioId : null,
        associadoId: s.associadoId,
        justificativa: s.justificativa,
        status: s.status,
        criadoEm: s.criadoEm,
        resolvidoEm: s.resolvidoEm,
      },
    })
    return this.toDomain(r)
  }

  async update(s: SolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio> {
    const r = await this.prisma.solicitacaoPatrimonio.update({
      where: { id: s.id },
      data: { status: s.status, resolvidoEm: s.resolvidoEm },
    })
    return this.toDomain(r)
  }

  private toDomain(r: PrismaSolicitacao): SolicitacaoPatrimonio {
    const tipo = r.tipoPatrimonio as TipoPatrimonio
    const patrimonioId =
      tipo === TipoPatrimonio.EQUIPAMENTO
        ? (r.equipamentoId ?? '')
        : (r.insumoId ?? '')

    return new SolicitacaoPatrimonio({
      id: r.id,
      tipoPatrimonio: tipo,
      patrimonioId,
      associadoId: r.associadoId,
      justificativa: r.justificativa ?? undefined,
      status: r.status as StatusSolicitacaoPatrimonio,
      criadoEm: r.criadoEm,
      resolvidoEm: r.resolvidoEm ?? undefined,
    })
  }
}
