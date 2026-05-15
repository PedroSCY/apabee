interface PrecoSafraProps {
  id: string
  tipoMateriaPrimaId: string
  safraId: string
  preco: number
}

/** Preço de referência de um TipoMateriaPrima para uma safra específica. Sobrescreve precoAtual do tipo no cálculo de contribuições (RN28). */
export class PrecoSafra {
  private readonly props: PrecoSafraProps

  constructor(props: PrecoSafraProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get tipoMateriaPrimaId(): string { return this.props.tipoMateriaPrimaId }
  get safraId(): string { return this.props.safraId }
  get preco(): number { return this.props.preco }

  atualizar(novoPreco: number): PrecoSafra {
    return new PrecoSafra({ ...this.props, preco: novoPreco })
  }

  toJSON() { return { ...this.props } }
}
