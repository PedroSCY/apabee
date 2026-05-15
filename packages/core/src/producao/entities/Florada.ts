interface FloradaProps {
  id: string
  nome: string
  descricao?: string
  ativa: boolean
  criadoEm: Date
}

/** Tipo de florada apícola — gerenciável pelo admin. */
export class Florada {
  private readonly props: FloradaProps

  constructor(props: FloradaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get descricao(): string | undefined { return this.props.descricao }
  get ativa(): boolean { return this.props.ativa }
  get criadoEm(): Date { return this.props.criadoEm }
}
