interface EstoqueProdutoProps {
  id: string;
  produtoId: string;
  quantidadeDisponivel: number;
  atualizadoEm: Date;
}

/** Entidade que representa o estoque disponível de um produto. */
export class EstoqueProduto {
  private readonly props: EstoqueProdutoProps;

  constructor(props: EstoqueProdutoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get produtoId(): string { return this.props.produtoId; }
  get quantidadeDisponivel(): number { return this.props.quantidadeDisponivel; }

  /** Verifica se há saldo suficiente para uma quantidade. */
  temSaldo(qtd: number): boolean {
    return this.props.quantidadeDisponivel >= qtd;
  }

  /** Adiciona quantidade ao estoque. */
  entrada(qtd: number): EstoqueProduto {
    if (qtd <= 0) throw new Error('Quantidade deve ser positiva.');
    return new EstoqueProduto({
      ...this.props,
      quantidadeDisponivel: this.props.quantidadeDisponivel + qtd,
      atualizadoEm: new Date(),
    });
  }

  /** Remove quantidade do estoque. Lança erro se saldo for insuficiente. */
  saida(qtd: number): EstoqueProduto {
    if (qtd <= 0) throw new Error('Quantidade deve ser positiva.');
    if (!this.temSaldo(qtd)) throw new Error('Saldo insuficiente no estoque de produto.');
    return new EstoqueProduto({
      ...this.props,
      quantidadeDisponivel: this.props.quantidadeDisponivel - qtd,
      atualizadoEm: new Date(),
    });
  }
}
