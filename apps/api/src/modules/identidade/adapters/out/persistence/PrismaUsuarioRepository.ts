import { Injectable } from '@nestjs/common'
import { Usuario as PrismaUsuario } from '@prisma/client'
import { IUsuarioRepository, Usuario } from '@apa/core'
import { RoleUsuario } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Usuario | null> {
    const record = await this.prisma.usuario.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const record = await this.prisma.usuario.findUnique({ where: { email } })
    return record ? this.toDomain(record) : null
  }

  async save(usuario: Usuario): Promise<Usuario> {
    const record = await this.prisma.usuario.create({
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        ativo: usuario.ativo,
        criadoEm: usuario.criadoEm,
      },
    })
    return this.toDomain(record)
  }

  async update(usuario: Usuario): Promise<Usuario> {
    const record = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        ativo: usuario.ativo,
      },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.usuario.delete({ where: { id } })
  }

  async contemRegistrosDeAutoria(id: string): Promise<boolean> {
    const [atas, docs] = await Promise.all([
      this.prisma.ata.count({ where: { autorId: id } }),
      this.prisma.documento.count({ where: { autorId: id } }),
    ])
    return atas > 0 || docs > 0
  }

  private toDomain(record: PrismaUsuario): Usuario {
    return new Usuario({
      id: record.id,
      nome: record.nome,
      email: record.email,
      role: record.role as RoleUsuario,
      ativo: record.ativo,
      criadoEm: record.criadoEm,
    })
  }
}
