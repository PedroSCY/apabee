import { Injectable } from '@nestjs/common'
import { SolicitacaoContato as PrismaSol } from '@prisma/client'
import { ISolicitacaoContatoRepository, SolicitacaoContato } from '@apa/core'
import { TipoSolicitacaoContato, StatusSolicitacaoContato } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaSolicitacaoContatoRepository implements ISolicitacaoContatoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SolicitacaoContato | null> {
    const r = await this.prisma.solicitacaoContato.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findAll(status?: StatusSolicitacaoContato): Promise<SolicitacaoContato[]> {
    const records = await this.prisma.solicitacaoContato.findMany({
      where: status ? { status } : undefined,
      orderBy: { criadoEm: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(s: SolicitacaoContato): Promise<SolicitacaoContato> {
    const r = await this.prisma.solicitacaoContato.create({
      data: {
        id: s.id,
        tipo: s.tipo,
        status: s.status,
        nome: s.nome,
        email: s.email,
        telefone: s.telefone,
        mensagem: s.mensagem,
        localizacao: s.localizacao,
        municipio: s.municipio,
        criadoEm: s.criadoEm,
      },
    })
    return this.toDomain(r)
  }

  async update(s: SolicitacaoContato): Promise<SolicitacaoContato> {
    const r = await this.prisma.solicitacaoContato.update({
      where: { id: s.id },
      data: { status: s.status },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.solicitacaoContato.delete({ where: { id } })
  }

  private toDomain(r: PrismaSol): SolicitacaoContato {
    return new SolicitacaoContato({
      id: r.id,
      tipo: r.tipo as TipoSolicitacaoContato,
      status: r.status as StatusSolicitacaoContato,
      nome: r.nome,
      email: r.email,
      telefone: r.telefone ?? undefined,
      mensagem: r.mensagem,
      localizacao: r.localizacao ?? undefined,
      municipio: r.municipio ?? undefined,
      criadoEm: r.criadoEm,
    })
  }
}
