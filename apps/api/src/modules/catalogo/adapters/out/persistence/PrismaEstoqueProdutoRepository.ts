import { Injectable } from '@nestjs/common'
import { EstoqueProduto as PrismaEstoqueProduto } from '@prisma/client'
import { EstoqueProduto, IEstoqueProdutoRepository } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaEstoqueProdutoRepository implements IEstoqueProdutoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduto(produtoId: string): Promise<EstoqueProduto | null> {
    const r = await this.prisma.estoqueProduto.findUnique({ where: { produtoId } })
    return r ? this.toDomain(r) : null
  }

  async save(estoque: EstoqueProduto): Promise<EstoqueProduto> {
    const r = await this.prisma.estoqueProduto.create({
      data: {
        id: estoque.id,
        produtoId: estoque.produtoId,
        quantidadeDisponivel: estoque.quantidadeDisponivel,
      },
    })
    return this.toDomain(r)
  }

  async update(estoque: EstoqueProduto): Promise<EstoqueProduto> {
    const r = await this.prisma.estoqueProduto.update({
      where: { produtoId: estoque.produtoId },
      data: { quantidadeDisponivel: estoque.quantidadeDisponivel },
    })
    return this.toDomain(r)
  }

  private toDomain(r: PrismaEstoqueProduto): EstoqueProduto {
    return new EstoqueProduto({
      id: r.id,
      produtoId: r.produtoId,
      quantidadeDisponivel: r.quantidadeDisponivel,
      atualizadoEm: r.atualizadoEm,
    })
  }
}
