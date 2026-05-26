import { Injectable } from '@nestjs/common'
import { ComposicaoProduto as PrismaComposicaoProduto } from '@prisma/client'
import { ComposicaoProduto, IComposicaoProdutoRepository } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaComposicaoProdutoRepository implements IComposicaoProdutoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduto(produtoId: string): Promise<ComposicaoProduto[]> {
    const records = await this.prisma.composicaoProduto.findMany({ where: { produtoId } })
    return records.map((r) => this.toDomain(r))
  }

  async save(composicao: ComposicaoProduto): Promise<ComposicaoProduto> {
    const r = await this.prisma.composicaoProduto.create({
      data: {
        id: composicao.id,
        produtoId: composicao.produtoId,
        tipoMateriaPrimaId: composicao.tipoMateriaPrimaId,
        quantidadeNecessaria: composicao.quantidadeNecessaria,
      },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.composicaoProduto.delete({ where: { id } })
  }

  private toDomain(r: PrismaComposicaoProduto): ComposicaoProduto {
    return new ComposicaoProduto({
      id: r.id,
      produtoId: r.produtoId,
      tipoMateriaPrimaId: r.tipoMateriaPrimaId,
      quantidadeNecessaria: Number(r.quantidadeNecessaria),
    })
  }
}
