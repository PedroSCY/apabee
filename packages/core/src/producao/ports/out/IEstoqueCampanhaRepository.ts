import { EstoqueCampanha } from '../../entities/EstoqueCampanha'
import { MovimentacaoEstoqueCampanha } from '../../entities/MovimentacaoEstoqueCampanha'

export interface IEstoqueCampanhaRepository {
  findByCampanha(campanhaId: string): Promise<EstoqueCampanha[]>
  findByCampanhaETipo(campanhaId: string, tipoMateriaPrimaId: string): Promise<EstoqueCampanha | null>
  save(estoque: EstoqueCampanha): Promise<EstoqueCampanha>
  update(estoque: EstoqueCampanha): Promise<EstoqueCampanha>
  salvarMovimentacao(mov: MovimentacaoEstoqueCampanha): Promise<MovimentacaoEstoqueCampanha>
  countSaidas(estoqueCampanhaId: string): Promise<number>
  findMovimentacoes(estoqueCampanhaId: string): Promise<MovimentacaoEstoqueCampanha[]>
}
