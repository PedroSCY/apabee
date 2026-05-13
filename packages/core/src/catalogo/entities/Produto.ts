import { StatusProduto } from '@apa/shared'

interface ProdutoProps {
  id: string
  nome: string
  slug: string
  descricao: string
  preco: number
  imagemUrl?: string
  status: StatusProduto
  loteOrigemId?: string
  criadoEm: Date
}

/** Entidade que representa um produto do catálogo da associação. */
export class Produto {
  private readonly props: ProdutoProps

  constructor(props: ProdutoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get slug(): string { return this.props.slug }
  get descricao(): string { return this.props.descricao }
  get preco(): number { return this.props.preco }
  get imagemUrl(): string | undefined { return this.props.imagemUrl }
  get status(): StatusProduto { return this.props.status }
  get loteOrigemId(): string | undefined { return this.props.loteOrigemId }
  get criadoEm(): Date { return this.props.criadoEm }

  /** Verifica se o produto está publicado e disponível para venda. */
  estaDisponivel(): boolean {
    return this.props.status === StatusProduto.PUBLICADO
  }

  /** Altera o status para PUBLICADO. */
  publicar(): Produto {
    return new Produto({ ...this.props, status: StatusProduto.PUBLICADO })
  }

  /** Reverte o status para RASCUNHO. */
  despublicar(): Produto {
    return new Produto({ ...this.props, status: StatusProduto.RASCUNHO })
  }

  /** Arquiva o produto (status ARQUIVADO). */
  arquivar(): Produto {
    return new Produto({ ...this.props, status: StatusProduto.ARQUIVADO })
  }

  /** Atualiza o preço do produto. Lança erro se o valor não for positivo. */
  atualizarPreco(preco: number): Produto {
    if (preco <= 0) throw new Error('Preço deve ser positivo.')
    return new Produto({ ...this.props, preco })
  }

  /** Associa o produto a um lote de origem. */
  comLoteOrigem(loteOrigemId: string): Produto {
    return new Produto({ ...this.props, loteOrigemId })
  }
}
