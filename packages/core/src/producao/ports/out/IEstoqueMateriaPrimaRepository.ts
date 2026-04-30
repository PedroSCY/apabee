import { EstoqueMateriaPrima } from '../../entities/EstoqueMateriaPrima';
import { MovimentacaoEstoque } from '../../entities/MovimentacaoEstoque';

export interface IEstoqueMateriaPrimaRepository {
  findByTipo(tipoMateriaPrimaId: string): Promise<EstoqueMateriaPrima | null>;
  update(estoque: EstoqueMateriaPrima): Promise<EstoqueMateriaPrima>;
  salvarMovimentacao(mov: MovimentacaoEstoque): Promise<MovimentacaoEstoque>;
  findMovimentacoesByEstoque(estoqueId: string): Promise<MovimentacaoEstoque[]>;
}
