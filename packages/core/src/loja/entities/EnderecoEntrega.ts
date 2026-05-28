interface EnderecoEntregaProps {
  id: string
  clienteId: string
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  principal: boolean
}

export class EnderecoEntrega {
  private readonly props: EnderecoEntregaProps

  constructor(props: EnderecoEntregaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get clienteId(): string { return this.props.clienteId }
  get apelido(): string { return this.props.apelido }
  get logradouro(): string { return this.props.logradouro }
  get numero(): string { return this.props.numero }
  get complemento(): string | undefined { return this.props.complemento }
  get bairro(): string { return this.props.bairro }
  get cidade(): string { return this.props.cidade }
  get estado(): string { return this.props.estado }
  get cep(): string { return this.props.cep }
  get principal(): boolean { return this.props.principal }

  marcarPrincipal(): EnderecoEntrega {
    return new EnderecoEntrega({ ...this.props, principal: true })
  }

  desmarcarPrincipal(): EnderecoEntrega {
    return new EnderecoEntrega({ ...this.props, principal: false })
  }

  formatado(): string {
    const compl = this.props.complemento ? `, ${this.props.complemento}` : ''
    return `${this.props.logradouro}, ${this.props.numero}${compl}, ${this.props.bairro}, ${this.props.cidade} - ${this.props.estado}, ${this.props.cep}`
  }
}
