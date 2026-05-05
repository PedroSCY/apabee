import { Injectable } from '@nestjs/common'
import { Produto as PrismaProduto } from '@prisma/client'
import { IProdutoRepository, Produto } from '@apa/core'
import { StatusProduto } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaProdutoRepository implements IProdutoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Produto | null> {
    const r = await this.prisma.produto.findUnique({ where: { id } })
    return r ? this.toDomain(r) : null
  }

  async findBySlug(slug: string): Promise<Produto | null> {
    const r = await this.prisma.produto.findUnique({ where: { slug } })
    return r ? this.toDomain(r) : null
  }

  async findAtivos(): Promise<Produto[]> {
    const records = await this.prisma.produto.findMany({
      where: { status: StatusProduto.PUBLICADO },
      orderBy: { criadoEm: 'desc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findAll(): Promise<Produto[]> {
    const records = await this.prisma.produto.findMany({ orderBy: { criadoEm: 'desc' } })
    return records.map((r) => this.toDomain(r))
  }

  async save(produto: Produto): Promise<Produto> {
    const r = await this.prisma.produto.create({
      data: {
        id: produto.id,
        nome: produto.nome,
        slug: produto.slug,
        descricao: produto.descricao,
        preco: produto.preco,
        imagemUrl: produto.imagemUrl,
        status: produto.status,
        loteOrigemId: produto.loteOrigemId,
        criadoEm: produto.criadoEm,
      },
    })
    return this.toDomain(r)
  }

  async update(produto: Produto): Promise<Produto> {
    const r = await this.prisma.produto.update({
      where: { id: produto.id },
      data: {
        nome: produto.nome,
        slug: produto.slug,
        descricao: produto.descricao,
        preco: produto.preco,
        imagemUrl: produto.imagemUrl,
        status: produto.status,
      },
    })
    return this.toDomain(r)
  }

  private toDomain(r: PrismaProduto): Produto {
    return new Produto({
      id: r.id,
      nome: r.nome,
      slug: r.slug,
      descricao: r.descricao,
      preco: Number(r.preco),
      imagemUrl: r.imagemUrl ?? undefined,
      status: r.status as StatusProduto,
      loteOrigemId: r.loteOrigemId ?? undefined,
      criadoEm: r.criadoEm,
    })
  }
}
