interface EstoqueProdutoProps {
  id: string;
  produtoId: string;
  quantidadeDisponivel: number;
  atualizadoEm: Date;
}

export class EstoqueProduto {
  private readonly props: EstoqueProdutoProps;

  constructor(props: EstoqueProdutoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get produtoId(): string { return this.props.produtoId; }
  get quantidadeDisponivel(): number { return this.props.quantidadeDisponivel; }

  temSaldo(qtd: number): boolean {
    return this.props.quantidadeDisponivel >= qtd;
  }

  entrada(qtd: number): EstoqueProduto {
    if (qtd <= 0) throw new Error('Quantidade deve ser positiva.');
    return new EstoqueProduto({
      ...this.props,
      quantidadeDisponivel: this.props.quantidadeDisponivel + qtd,
      atualizadoEm: new Date(),
    });
  }

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
