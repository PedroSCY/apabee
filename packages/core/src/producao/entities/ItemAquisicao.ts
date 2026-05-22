interface ItemAquisicaoProps {
  id: string
  campanhaId: string
  nome: string
  precoUnitario: number
  quantidadeMeta: number
  quantidadeTotalPedida: number
  unidade: string
  tipoDestinoId?: string
  criadoEm: Date
}

/** Item de uma campanha de aquisição coletiva. Define o produto, preço unitário e meta mínima. */
export class ItemAquisicao {
  private readonly props: ItemAquisicaoProps

  constructor(props: ItemAquisicaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get nome(): string { return this.props.nome }
  get precoUnitario(): number { return this.props.precoUnitario }
  get quantidadeMeta(): number { return this.props.quantidadeMeta }
  get quantidadeTotalPedida(): number { return this.props.quantidadeTotalPedida }
  get unidade(): string { return this.props.unidade }
  get tipoDestinoId(): string | undefined { return this.props.tipoDestinoId }
  get criadoEm(): Date { return this.props.criadoEm }

  get metaAtingida(): boolean {
    return this.props.quantidadeTotalPedida >= this.props.quantidadeMeta
  }

  adicionarPedido(quantidade: number): ItemAquisicao {
    return new ItemAquisicao({ ...this.props, quantidadeTotalPedida: this.props.quantidadeTotalPedida + quantidade })
  }

  removerPedido(quantidade: number): ItemAquisicao {
    return new ItemAquisicao({ ...this.props, quantidadeTotalPedida: Math.max(0, this.props.quantidadeTotalPedida - quantidade) })
  }

  valorTotalPedido(): number {
    return this.props.quantidadeTotalPedida * this.props.precoUnitario
  }

  toJSON() { return { ...this.props } }
}
