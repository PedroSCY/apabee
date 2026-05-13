import { UnidadeMedida } from '@apa/shared'

interface TipoMateriaPrimaProps {
  id: string
  nome: string
  unidade: UnidadeMedida
  descricao?: string
}

/** Tipo de matéria-prima (ex.: mel, cera, própolis). */
export class TipoMateriaPrima {
  private readonly props: TipoMateriaPrimaProps

  constructor(props: TipoMateriaPrimaProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get nome(): string {
    return this.props.nome
  }
  get unidade(): UnidadeMedida {
    return this.props.unidade
  }
  get descricao(): string | undefined {
    return this.props.descricao
  }

  toJSON() { return { ...this.props } }
}
