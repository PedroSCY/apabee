interface ClienteProps {
  id: string
  nome: string
  email: string
  telefone?: string
  fotoUrl?: string
  criadoEm: Date
  atualizadoEm: Date
}

export class Cliente {
  private readonly props: ClienteProps

  constructor(props: ClienteProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get email(): string { return this.props.email }
  get telefone(): string | undefined { return this.props.telefone }
  get fotoUrl(): string | undefined { return this.props.fotoUrl }
  get criadoEm(): Date { return this.props.criadoEm }
  get atualizadoEm(): Date { return this.props.atualizadoEm }

  atualizarDados(nome: string, telefone?: string): Cliente {
    return new Cliente({ ...this.props, nome, telefone })
  }
}
