import { Injectable } from '@nestjs/common'
import { ConfirmacaoAtomicaParams, IOrdemProducaoRepository, MaterialConsumido, OrdemProducao } from '@apa/core'
import { StatusOrdemProducao } from '@apa/shared'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaOrdemProducaoRepository implements IOrdemProducaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OrdemProducao | null> {
    const r = await this.prisma.ordemProducao.findUnique({ where: { id }, include: { materiaisConsumidos: true } })
    return r ? this.toDomain(r) : null
  }

  async findByCampanha(campanhaId: string, statuses?: string[]): Promise<OrdemProducao[]> {
    const rs = await this.prisma.ordemProducao.findMany({
      where: { campanhaId, ...(statuses ? { status: { in: statuses as any } } : {}) },
      include: { materiaisConsumidos: true },
      orderBy: { criadoEm: 'desc' },
    })
    return rs.map(r => this.toDomain(r))
  }

  async save(ordem: OrdemProducao): Promise<OrdemProducao> {
    const r = await this.prisma.ordemProducao.create({
      data: {
        id: ordem.id, campanhaId: ordem.campanhaId, produtoId: ordem.produtoId,
        quantidade: ordem.quantidade, status: ordem.status, perdaPercentual: ordem.perdaPercentual,
        criadoEm: ordem.criadoEm,
      },
      include: { materiaisConsumidos: true },
    })
    return this.toDomain(r)
  }

  async update(ordem: OrdemProducao): Promise<OrdemProducao> {
    await this.prisma.materialOrdemProducao.deleteMany({ where: { ordemProducaoId: ordem.id } })

    // Busca unidades em batch para preencher o campo obrigatório do schema
    const tipoMap = new Map<string, string>()
    if (ordem.materiaisConsumidos.length > 0) {
      const ids = [...new Set(ordem.materiaisConsumidos.map(m => m.tipoMateriaPrimaId))]
      const tipos = await this.prisma.tipoMateriaPrima.findMany({
        where: { id: { in: ids } },
        select: { id: true, unidade: true },
      })
      for (const t of tipos) tipoMap.set(t.id, t.unidade)
    }

    const r = await this.prisma.ordemProducao.update({
      where: { id: ordem.id },
      data: {
        status: ordem.status,
        produtosGerados: ordem.produtosGerados ?? null,
        quantidadeReal: ordem.quantidadeReal ?? null,
        sobrasRecuperadas: ordem.sobrasRecuperadas ?? null,
        observacao: ordem.observacao ?? null,
        confirmadoEm: ordem.confirmadoEm ?? null,
        materiaisConsumidos: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: ordem.materiaisConsumidos.map(m => ({
            id: crypto.randomUUID() as string,
            tipoMateriaPrimaId: m.tipoMateriaPrimaId,
            quantidade: m.quantidade,
            unidade: tipoMap.get(m.tipoMateriaPrimaId)!,
          })) as any,
        },
      },
      include: { materiaisConsumidos: true },
    })
    return this.toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.materialOrdemProducao.deleteMany({ where: { ordemProducaoId: id } })
    await this.prisma.ordemProducao.delete({ where: { id } })
  }

  async salvarConfirmacaoAtomico(params: ConfirmacaoAtomicaParams): Promise<OrdemProducao> {
    const { ordemConfirmada, estoquesAtualizados, movimentacoesCampanha, estoquePoolAtualizado, movimentacaoPool, estoqueProduto, vincularProdutoCampanha } = params

    // Busca unidades em batch antes da transação
    const tipoMap = new Map<string, string>()
    if (ordemConfirmada.materiaisConsumidos.length > 0) {
      const ids = [...new Set(ordemConfirmada.materiaisConsumidos.map(m => m.tipoMateriaPrimaId))]
      const tipos = await this.prisma.tipoMateriaPrima.findMany({
        where: { id: { in: ids } },
        select: { id: true, unidade: true },
      })
      for (const t of tipos) tipoMap.set(t.id, t.unidade)
    }

    const r = await this.prisma.$transaction(async (tx) => {
      // 1. Consome estoques da campanha
      for (const estoque of estoquesAtualizados) {
        await tx.estoqueCampanha.update({
          where: { id: estoque.id },
          data: { quantidadeDisponivel: estoque.quantidadeDisponivel },
        })
      }

      // 2. Registra movimentações de saída da campanha
      for (const mov of movimentacoesCampanha) {
        await tx.movimentacaoEstoqueCampanha.create({
          data: {
            id: mov.id,
            estoqueCampanhaId: mov.estoqueCampanhaId,
            tipo: mov.tipo,
            quantidade: mov.quantidade,
            referenciaId: mov.referenciaId,
            criadoEm: mov.criadoEm,
          },
        })
      }

      // 3. Devolve sobras ao pool
      if (estoquePoolAtualizado) {
        await tx.estoqueMateriaPrima.update({
          where: { id: estoquePoolAtualizado.id },
          data: { quantidadeDisponivel: estoquePoolAtualizado.quantidadeDisponivel },
        })
      }
      if (movimentacaoPool) {
        await tx.movimentacaoEstoque.create({
          data: {
            id: movimentacaoPool.id,
            estoqueId: movimentacaoPool.estoqueId,
            tipo: movimentacaoPool.tipo,
            quantidade: movimentacaoPool.quantidade,
            referenciaId: movimentacaoPool.referenciaId ?? '',
            criadoEm: movimentacaoPool.criadoEm,
          },
        })
      }

      // 4. Atualiza ou cria EstoqueProduto
      if (estoqueProduto.id) {
        await tx.estoqueProduto.update({
          where: { produtoId: estoqueProduto.produtoId },
          data: { quantidadeDisponivel: estoqueProduto.quantidadeNova },
        })
      } else {
        await tx.estoqueProduto.create({
          data: {
            id: crypto.randomUUID() as string,
            produtoId: estoqueProduto.produtoId,
            quantidadeDisponivel: estoqueProduto.quantidadeNova,
          },
        })
      }

      // 5. Vincula Produto à campanha (RN24)
      if (vincularProdutoCampanha) {
        await tx.produto.update({
          where: { id: vincularProdutoCampanha.produtoId },
          data: { campanhaId: vincularProdutoCampanha.campanhaId },
        })
      }

      // 6. Atualiza ordem com status CONCLUIDA e materiais consumidos
      await tx.materialOrdemProducao.deleteMany({ where: { ordemProducaoId: ordemConfirmada.id } })
      return tx.ordemProducao.update({
        where: { id: ordemConfirmada.id },
        data: {
          status: ordemConfirmada.status,
          produtosGerados: ordemConfirmada.produtosGerados ?? null,
          quantidadeReal: ordemConfirmada.quantidadeReal ?? null,
          sobrasRecuperadas: ordemConfirmada.sobrasRecuperadas ?? null,
          observacao: ordemConfirmada.observacao ?? null,
          confirmadoEm: ordemConfirmada.confirmadoEm ?? null,
          materiaisConsumidos: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: ordemConfirmada.materiaisConsumidos.map(m => ({
              id: crypto.randomUUID() as string,
              tipoMateriaPrimaId: m.tipoMateriaPrimaId,
              quantidade: m.quantidade,
              unidade: tipoMap.get(m.tipoMateriaPrimaId)!,
            })) as any,
          },
        },
        include: { materiaisConsumidos: true },
      })
    })

    return this.toDomain(r)
  }

  private toDomain(r: any): OrdemProducao {
    const materiais: MaterialConsumido[] = (r.materiaisConsumidos ?? []).map((m: any) => ({
      tipoMateriaPrimaId: m.tipoMateriaPrimaId,
      quantidade: Number(m.quantidade),
    }))
    return new OrdemProducao({
      id: r.id, campanhaId: r.campanhaId, produtoId: r.produtoId, quantidade: r.quantidade,
      status: r.status as StatusOrdemProducao, perdaPercentual: Number(r.perdaPercentual),
      produtosGerados: r.produtosGerados ?? undefined,
      quantidadeReal: r.quantidadeReal ?? undefined,
      sobrasRecuperadas: r.sobrasRecuperadas ? Number(r.sobrasRecuperadas) : undefined,
      observacao: r.observacao ?? undefined,
      materiaisConsumidos: materiais,
      criadoEm: r.criadoEm,
      confirmadoEm: r.confirmadoEm ?? undefined,
    })
  }
}
