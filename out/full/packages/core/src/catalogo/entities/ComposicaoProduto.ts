import { UnidadeMedida } from '@apa/shared';

interface ComposicaoProdutoProps {
  id: string;
  produtoId: string;
  tipoMateriaPrimaId: string;
  quantidadeNecessaria: number;
  unidade: UnidadeMedida;
}

/** Entidade que define a receita (matéria-prima necessária) de um produto. */
export class ComposicaoProduto {
  private readonly props: ComposicaoProdutoProps;

  constructor(props: ComposicaoProdutoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get produtoId(): string { return this.props.produtoId; }
  get tipoMateriaPrimaId(): string { return this.props.tipoMateriaPrimaId; }
  get quantidadeNecessaria(): number { return this.props.quantidadeNecessaria; }
  get unidade(): UnidadeMedida { return this.props.unidade; }

  /** Verifica se há matéria-prima suficiente para produzir N unidades (RN05). */
  verificarDisponibilidade(estoqueDisponivel: number, quantidadeProdutos: number): boolean {
    return estoqueDisponivel >= this.props.quantidadeNecessaria * quantidadeProdutos;
  }

  /** Calcula o consumo total de matéria-prima para produzir N unidades. */
  consumoTotal(quantidadeProdutos: number): number {
    return this.props.quantidadeNecessaria * quantidadeProdutos;
  }
}
