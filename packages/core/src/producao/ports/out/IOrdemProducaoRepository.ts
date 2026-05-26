import { EstoqueCampanha } from '../../entities/EstoqueCampanha'
import { EstoqueMateriaPrima } from '../../entities/EstoqueMateriaPrima'
import { MovimentacaoEstoque } from '../../entities/MovimentacaoEstoque'
import { MovimentacaoEstoqueCampanha } from '../../entities/MovimentacaoEstoqueCampanha'
import { OrdemProducao } from '../../entities/OrdemProducao'

export interface ConfirmacaoAtomicaParams {
  ordemConfirmada: OrdemProducao
  estoquesAtualizados: EstoqueCampanha[]
  movimentacoesCampanha: MovimentacaoEstoqueCampanha[]
  estoquePoolAtualizado?: EstoqueMateriaPrima
  movimentacaoPool?: MovimentacaoEstoque
  estoqueProduto: { id?: string; produtoId: string; quantidadeNova: number }
  vincularProdutoCampanha?: { produtoId: string; campanhaId: string }
}

/** Repositório de ordens de produção. */
export interface IOrdemProducaoRepository {
  findById(id: string): Promise<OrdemProducao | null>
  findByCampanha(campanhaId: string, statuses?: string[]): Promise<OrdemProducao[]>
  save(ordem: OrdemProducao): Promise<OrdemProducao>
  update(ordem: OrdemProducao): Promise<OrdemProducao>
  delete(id: string): Promise<void>
  salvarConfirmacaoAtomico(params: ConfirmacaoAtomicaParams): Promise<OrdemProducao>
}
