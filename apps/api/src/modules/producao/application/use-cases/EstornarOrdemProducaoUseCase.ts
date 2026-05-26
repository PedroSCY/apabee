import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ICampanhaRepository,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  IEstoqueProdutoRepository,
  IEstornarOrdemProducaoUseCase,
  IOrdemProducaoRepository,
  OrdemProducao,
} from '@apa/core'
import { StatusCampanha, StatusOrdemProducao } from '@apa/shared'
import {
  CAMPANHA_REPOSITORY,
  ESTOQUE_CAMPANHA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  ORDEM_PRODUCAO_REPOSITORY,
} from '../../producao.tokens'

const ESTOQUE_PRODUTO_REPOSITORY = 'ESTOQUE_PRODUTO_REPOSITORY'

@Injectable()
/** Reverte uma OrdemProducao CONCLUIDA para RASCUNHO: restaura EstoqueCampanha, reduz EstoqueProduto e reverte sobras do pool. */
export class EstornarOrdemProducaoUseCase implements IEstornarOrdemProducaoUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY)
    private readonly estoqueProdutoRepo: IEstoqueProdutoRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly poolRepo: IEstoqueMateriaPrimaRepository,
  ) {}

  async execute(campanhaId: string, ordemId: string): Promise<OrdemProducao> {
    const ordem = await this.ordemRepo.findById(ordemId)
    if (!ordem) throw new NotFoundException('Ordem de produção não encontrada')
    if (ordem.campanhaId !== campanhaId)
      throw new NotFoundException('Ordem não pertence à campanha informada')
    if (ordem.status !== StatusOrdemProducao.CONCLUIDA)
      throw new ConflictException('Apenas ordens CONCLUIDAS podem ser estornadas')

    const campanha = await this.campanhaRepo.findById(campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.ATIVA)
      throw new ConflictException('Estorno de ordem permitido apenas em campanhas ATIVAS')

    // Restaura matérias-primas ao EstoqueCampanha
    for (const material of ordem.materiaisConsumidos) {
      const estoque = await this.estoqueCampanhaRepo.findByCampanhaETipo(
        campanhaId,
        material.tipoMateriaPrimaId,
      )
      if (estoque) {
        await this.estoqueCampanhaRepo.update(estoque.entrada(material.quantidade))
      }
    }

    // Reduz EstoqueProduto pelo que foi produzido (clamped para não negativar)
    if (ordem.quantidadeReal) {
      const estoqueProduto = await this.estoqueProdutoRepo.findByProduto(ordem.produtoId)
      if (estoqueProduto) {
        const aReduzir = Math.min(ordem.quantidadeReal, estoqueProduto.quantidadeDisponivel)
        if (aReduzir > 0) {
          await this.estoqueProdutoRepo.update(estoqueProduto.saida(aReduzir))
        }
      }
    }

    // Reverte sobras que foram devolvidas ao pool (primeiro material da composição — mesmo padrão do ConfirmarOrdem)
    if (ordem.sobrasRecuperadas && ordem.sobrasRecuperadas > 0 && ordem.materiaisConsumidos.length > 0) {
      const tipoId = ordem.materiaisConsumidos[0]!.tipoMateriaPrimaId
      const pool = await this.poolRepo.findByTipo(tipoId)
      if (pool) {
        const aReduzir = Math.min(ordem.sobrasRecuperadas, pool.quantidadeDisponivel)
        if (aReduzir > 0) {
          await this.poolRepo.update(pool.saida(aReduzir))
        }
      }
    }

    return this.ordemRepo.update(ordem.estornar())
  }
}
