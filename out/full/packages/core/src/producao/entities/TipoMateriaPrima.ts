import { UnidadeMedida } from '@apa/shared'

interface TipoMateriaPrimaProps {
  id: string
  nome: string
  unidade: UnidadeMedida
  descricao?: string
  precoAtual?: number
}

/** Tipo de matéria-prima (ex.: mel, cera, própolis). precoAtual define o valor de referência para conversão de contribuições em R$. */
export class TipoMateriaPrima {
  private readonly props: TipoMateriaPrimaProps

  constructor(props: TipoMateriaPrimaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get unidade(): UnidadeMedida { return this.props.unidade }
  get descricao(): string | undefined { return this.props.descricao }
  get precoAtual(): number | undefined { return this.props.precoAtual }

  atualizarPreco(novoPreco: number): TipoMateriaPrima {
    return new TipoMateriaPrima({ ...this.props, precoAtual: novoPreco })
  }

  toJSON() { return { ...this.props } }
}
