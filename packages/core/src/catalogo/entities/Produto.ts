import { StatusProduto } from '@apa/shared'

interface ProdutoProps {
  id: string
  nome: string
  slug: string
  descricao: string
  preco: number
  imagemUrl?: string
  status: StatusProduto
  campanhaId?: string
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
  get campanhaId(): string | undefined { return this.props.campanhaId }
  get criadoEm(): Date { return this.props.criadoEm }

  estaDisponivel(): boolean { return this.props.status === StatusProduto.PUBLICADO }

  publicar(): Produto { return new Produto({ ...this.props, status: StatusProduto.PUBLICADO }) }
  despublicar(): Produto { return new Produto({ ...this.props, status: StatusProduto.RASCUNHO }) }
  arquivar(): Produto { return new Produto({ ...this.props, status: StatusProduto.ARQUIVADO }) }

  atualizarPreco(preco: number): Produto {
    if (preco <= 0) throw new Error('Preço deve ser positivo.')
    return new Produto({ ...this.props, preco })
  }

  comCampanha(campanhaId: string): Produto {
    return new Produto({ ...this.props, campanhaId })
  }
}
