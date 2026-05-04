import { EstoqueMateriaPrima } from '../../entities/EstoqueMateriaPrima';
import { MovimentacaoEstoque } from '../../entities/MovimentacaoEstoque';

export interface IEstoqueMateriaPrimaRepository {
  findAll(): Promise<EstoqueMateriaPrima[]>;
  findByTipo(tipoMateriaPrimaId: string): Promise<EstoqueMateriaPrima | null>;
  save(estoque: EstoqueMateriaPrima): Promise<EstoqueMateriaPrima>;
  update(estoque: EstoqueMateriaPrima): Promise<EstoqueMateriaPrima>;
  salvarMovimentacao(mov: MovimentacaoEstoque): Promise<MovimentacaoEstoque>;
  findMovimentacoesByEstoque(estoqueId: string): Promise<MovimentacaoEstoque[]>;
}
