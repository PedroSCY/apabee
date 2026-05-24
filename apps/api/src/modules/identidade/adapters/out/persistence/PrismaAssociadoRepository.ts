import { Injectable } from '@nestjs/common'
import { Associado as PrismaAssociado, Usuario as PrismaUsuario } from '@prisma/client'
import { Associado, IAssociadoRepository, Usuario } from '@apa/core'
import { RoleUsuario, StatusAssociado } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

type AssociadoWithUsuario = PrismaAssociado & { usuario: PrismaUsuario }

@Injectable()
/** Adaptador Prisma para o repositório de associados */
export class PrismaAssociadoRepository implements IAssociadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca um associado pelo ID (ignora soft-deleted) */
  async findById(id: string): Promise<Associado | null> {
    const record = await this.prisma.associado.findUnique({
      where: { id },
      include: { usuario: true },
    })
    if (!record || record.deletadoEm) return null
    return this.toDomain(record)
  }

  /** Busca um associado pelo ID do usuário vinculado (ignora soft-deleted) */
  async findByUsuarioId(usuarioId: string): Promise<Associado | null> {
    const record = await this.prisma.associado.findUnique({
      where: { usuarioId },
      include: { usuario: true },
    })
    if (!record || record.deletadoEm) return null
    return this.toDomain(record)
  }

  /** Retorna todos os associados não deletados */
  async findAll(): Promise<Associado[]> {
    const records = await this.prisma.associado.findMany({
      where: { deletadoEm: null },
      include: { usuario: true },
    })
    return records.map((r) => this.toDomain(r))
  }

  /** Persiste um novo associado no banco */
  async save(associado: Associado): Promise<Associado> {
    const record = await this.prisma.associado.create({
      data: {
        id: associado.id,
        usuarioId: associado.usuario.id,
        cpf: associado.cpf,
        dataIngresso: associado.dataIngresso,
        observacoes: associado.observacoes,
        status: associado.status,
      },
      include: { usuario: true },
    })
    return this.toDomain(record)
  }

  /** Atualiza os dados de um associado existente */
  async update(associado: Associado): Promise<Associado> {
    const record = await this.prisma.associado.update({
      where: { id: associado.id },
      data: {
        cpf: associado.cpf,
        status: associado.status,
        dataIngresso: associado.dataIngresso,
        observacoes: associado.observacoes,
        isentoMensalidade: associado.isentoMensalidade,
        deletadoEm: associado.deletadoEm,
      },
      include: { usuario: true },
    })
    return this.toDomain(record)
  }

  /** Soft delete: marca deletadoEm e remove do banco apenas o usuário Supabase */
  async delete(id: string): Promise<void> {
    await this.prisma.associado.update({
      where: { id },
      data: { deletadoEm: new Date() },
    })
  }

  private toDomain(record: AssociadoWithUsuario): Associado {
    const usuario = new Usuario({
      id: record.usuario.id,
      nome: record.usuario.nome,
      email: record.usuario.email,
      telefone: record.usuario.telefone ?? undefined,
      role: record.usuario.role as RoleUsuario,
      ativo: record.usuario.ativo,
      criadoEm: record.usuario.criadoEm,
      deletadoEm: record.usuario.deletadoEm ?? undefined,
    })
    return new Associado({
      id: record.id,
      usuario,
      cpf: record.cpf ?? undefined,
      dataIngresso: record.dataIngresso,
      observacoes: record.observacoes ?? undefined,
      status: record.status as StatusAssociado,
      isentoMensalidade: record.isentoMensalidade,
      deletadoEm: record.deletadoEm ?? undefined,
    })
  }
}
