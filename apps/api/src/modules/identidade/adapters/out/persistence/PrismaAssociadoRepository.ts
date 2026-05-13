import { Injectable } from '@nestjs/common'
import { Associado as PrismaAssociado, Usuario as PrismaUsuario } from '@prisma/client'
import { Associado, IAssociadoRepository, Usuario } from '@apa/core'
import { RoleUsuario, StatusAssociado } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

type AssociadoWithUsuario = PrismaAssociado & { usuario: PrismaUsuario }

@Injectable()
export class PrismaAssociadoRepository implements IAssociadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Associado | null> {
    const record = await this.prisma.associado.findUnique({
      where: { id },
      include: { usuario: true },
    })
    return record ? this.toDomain(record) : null
  }

  async findByUsuarioId(usuarioId: string): Promise<Associado | null> {
    const record = await this.prisma.associado.findUnique({
      where: { usuarioId },
      include: { usuario: true },
    })
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<Associado[]> {
    const records = await this.prisma.associado.findMany({
      include: { usuario: true },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(associado: Associado): Promise<Associado> {
    const record = await this.prisma.associado.create({
      data: {
        id: associado.id,
        usuarioId: associado.usuario.id,
        dataIngresso: associado.dataIngresso,
        observacoes: associado.observacoes,
        status: associado.status,
      },
      include: { usuario: true },
    })
    return this.toDomain(record)
  }

  async update(associado: Associado): Promise<Associado> {
    const record = await this.prisma.associado.update({
      where: { id: associado.id },
      data: {
        status: associado.status,
        dataIngresso: associado.dataIngresso,
        observacoes: associado.observacoes,
      },
      include: { usuario: true },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.associado.delete({ where: { id } })
  }

  private toDomain(record: AssociadoWithUsuario): Associado {
    const usuario = new Usuario({
      id: record.usuario.id,
      nome: record.usuario.nome,
      email: record.usuario.email,
      role: record.usuario.role as RoleUsuario,
      ativo: record.usuario.ativo,
      criadoEm: record.usuario.criadoEm,
    })
    return new Associado({
      id: record.id,
      usuario,
      dataIngresso: record.dataIngresso,
      observacoes: record.observacoes ?? undefined,
      status: record.status as StatusAssociado,
    })
  }
}
