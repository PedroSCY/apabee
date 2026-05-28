interface MetaProducaoProps {
  id: string
  campanhaId: string
  produtoId: string
  quantidadePlanejada: number
  perdaPercentualEstimada: number
  criadoEm: Date
}

export class MetaProducao {
  private readonly props: MetaProducaoProps

  constructor(props: MetaProducaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get produtoId(): string { return this.props.produtoId }
  get quantidadePlanejada(): number { return this.props.quantidadePlanejada }
  get perdaPercentualEstimada(): number { return this.props.perdaPercentualEstimada }
  get criadoEm(): Date { return this.props.criadoEm }

  /** Calcula o consumo estimado de um ingrediente considerando perda. */
  consumoEstimado(quantidadeNecessariaPorUnidade: number): number {
    return quantidadeNecessariaPorUnidade * this.props.quantidadePlanejada * (1 + this.props.perdaPercentualEstimada / 100)
  }

}
