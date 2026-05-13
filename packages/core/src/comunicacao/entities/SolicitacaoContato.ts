import { TipoSolicitacaoContato, StatusSolicitacaoContato } from '@apa/shared'

/** Propriedades da entidade SolicitacaoContato. */
interface SolicitacaoContatoProps {
  id: string
  tipo: TipoSolicitacaoContato
  status: StatusSolicitacaoContato
  nome: string
  email: string
  telefone?: string
  mensagem: string
  localizacao?: string
  municipio?: string
  criadoEm: Date
}

/** Solicitação de contato de visitante (público). */
export class SolicitacaoContato {
  private readonly props: SolicitacaoContatoProps

  constructor(props: SolicitacaoContatoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get tipo(): TipoSolicitacaoContato { return this.props.tipo }
  get status(): StatusSolicitacaoContato { return this.props.status }
  get nome(): string { return this.props.nome }
  get email(): string { return this.props.email }
  get telefone(): string | undefined { return this.props.telefone }
  get mensagem(): string { return this.props.mensagem }
  get localizacao(): string | undefined { return this.props.localizacao }
  get municipio(): string | undefined { return this.props.municipio }
  get criadoEm(): Date { return this.props.criadoEm }

  /** Marca a solicitação como visualizada. */
  visualizar(): SolicitacaoContato {
    return new SolicitacaoContato({ ...this.props, status: StatusSolicitacaoContato.VISUALIZADA })
  }

  /** Marca a solicitação como resolvida. */
  resolver(): SolicitacaoContato {
    return new SolicitacaoContato({ ...this.props, status: StatusSolicitacaoContato.RESOLVIDA })
  }
}
