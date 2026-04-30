interface ProdutoProps {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  ativo: boolean;
  loteOrigemId?: string;
  criadoEm: Date;
}

export class Produto {
  private readonly props: ProdutoProps;

  constructor(props: ProdutoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get nome(): string { return this.props.nome; }
  get slug(): string { return this.props.slug; }
  get descricao(): string { return this.props.descricao; }
  get preco(): number { return this.props.preco; }
  get imagemUrl(): string | undefined { return this.props.imagemUrl; }
  get ativo(): boolean { return this.props.ativo; }
  get loteOrigemId(): string | undefined { return this.props.loteOrigemId; }

  estaDisponivel(): boolean { return this.props.ativo; }

  publicar(): Produto {
    return new Produto({ ...this.props, ativo: true });
  }

  despublicar(): Produto {
    return new Produto({ ...this.props, ativo: false });
  }

  atualizarPreco(preco: number): Produto {
    if (preco <= 0) throw new Error('Preço deve ser positivo.');
    return new Produto({ ...this.props, preco });
  }
}
