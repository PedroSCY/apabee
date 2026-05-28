import { Injectable } from '@nestjs/common'
import { Cliente, EnderecoEntrega, IClienteRepository } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Cliente | null> {
    const r = await this.prisma.cliente.findUnique({ where: { id } })
    return r ? this.toClienteDomain(r) : null
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    const r = await this.prisma.cliente.findUnique({ where: { email } })
    return r ? this.toClienteDomain(r) : null
  }

  async findAll(): Promise<Cliente[]> {
    const rows = await this.prisma.cliente.findMany({ orderBy: { criadoEm: 'desc' } })
    return rows.map(r => this.toClienteDomain(r))
  }

  async save(cliente: Cliente): Promise<Cliente> {
    const r = await this.prisma.cliente.upsert({
      where: { id: cliente.id },
      create: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        fotoUrl: cliente.fotoUrl,
      },
      update: {
        nome: cliente.nome,
        telefone: cliente.telefone,
        fotoUrl: cliente.fotoUrl,
      },
    })
    return this.toClienteDomain(r)
  }

  async update(cliente: Cliente): Promise<Cliente> {
    const r = await this.prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        nome: cliente.nome,
        telefone: cliente.telefone ?? null,
        fotoUrl: cliente.fotoUrl ?? null,
      },
    })
    return this.toClienteDomain(r)
  }

  async findEnderecosByClienteId(clienteId: string): Promise<EnderecoEntrega[]> {
    const rows = await this.prisma.enderecoEntrega.findMany({
      where: { clienteId },
      orderBy: [{ principal: 'desc' }, { id: 'asc' }],
    })
    return rows.map(r => this.toEnderecoDomain(r))
  }

  async findEnderecoById(id: string): Promise<EnderecoEntrega | null> {
    const r = await this.prisma.enderecoEntrega.findUnique({ where: { id } })
    return r ? this.toEnderecoDomain(r) : null
  }

  async saveEndereco(endereco: EnderecoEntrega): Promise<EnderecoEntrega> {
    const r = await this.prisma.enderecoEntrega.create({
      data: {
        id: endereco.id,
        clienteId: endereco.clienteId,
        apelido: endereco.apelido,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        cep: endereco.cep,
        principal: endereco.principal,
      },
    })
    return this.toEnderecoDomain(r)
  }

  async updateEndereco(endereco: EnderecoEntrega): Promise<EnderecoEntrega> {
    const r = await this.prisma.enderecoEntrega.update({
      where: { id: endereco.id },
      data: {
        apelido: endereco.apelido,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento ?? null,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        cep: endereco.cep,
        principal: endereco.principal,
      },
    })
    return this.toEnderecoDomain(r)
  }

  async deleteEndereco(id: string): Promise<void> {
    await this.prisma.enderecoEntrega.delete({ where: { id } })
  }

  async desmarcarTodosPrincipais(clienteId: string): Promise<void> {
    await this.prisma.enderecoEntrega.updateMany({
      where: { clienteId, principal: true },
      data: { principal: false },
    })
  }

  private toClienteDomain(r: any): Cliente {
    return new Cliente({
      id: r.id,
      nome: r.nome,
      email: r.email,
      telefone: r.telefone ?? undefined,
      fotoUrl: r.fotoUrl ?? undefined,
      criadoEm: r.criadoEm,
      atualizadoEm: r.atualizadoEm,
    })
  }

  private toEnderecoDomain(r: any): EnderecoEntrega {
    return new EnderecoEntrega({
      id: r.id,
      clienteId: r.clienteId,
      apelido: r.apelido,
      logradouro: r.logradouro,
      numero: r.numero,
      complemento: r.complemento ?? undefined,
      bairro: r.bairro,
      cidade: r.cidade,
      estado: r.estado,
      cep: r.cep,
      principal: r.principal,
    })
  }
}
