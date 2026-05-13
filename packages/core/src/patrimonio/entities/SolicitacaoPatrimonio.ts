import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'

interface SolicitacaoPatrimonioProps {
  id: string
  tipoPatrimonio: TipoPatrimonio
  patrimonioId: string
  associadoId: string
  justificativa?: string
  status: StatusSolicitacaoPatrimonio
  criadoEm: Date
  resolvidoEm?: Date
}

export class SolicitacaoPatrimonio {
  private readonly props: SolicitacaoPatrimonioProps

  constructor(props: SolicitacaoPatrimonioProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get tipoPatrimonio(): TipoPatrimonio { return this.props.tipoPatrimonio }
  get patrimonioId(): string { return this.props.patrimonioId }
  get associadoId(): string { return this.props.associadoId }
  get justificativa(): string | undefined { return this.props.justificativa }
  get status(): StatusSolicitacaoPatrimonio { return this.props.status }
  get criadoEm(): Date { return this.props.criadoEm }
  get resolvidoEm(): Date | undefined { return this.props.resolvidoEm }

  isPendente(): boolean {
    return this.props.status === StatusSolicitacaoPatrimonio.PENDENTE
  }

  aprovar(): SolicitacaoPatrimonio {
    return new SolicitacaoPatrimonio({
      ...this.props,
      status: StatusSolicitacaoPatrimonio.APROVADA,
      resolvidoEm: new Date(),
    })
  }

  rejeitar(): SolicitacaoPatrimonio {
    return new SolicitacaoPatrimonio({
      ...this.props,
      status: StatusSolicitacaoPatrimonio.REJEITADA,
      resolvidoEm: new Date(),
    })
  }
}
