import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'

interface SolicitacaoPatrimonioProps {
  id: string
  tipoPatrimonio: TipoPatrimonio
  /** ID do equipamento — preenchido quando tipoPatrimonio = EQUIPAMENTO */
  patrimonioId?: string
  /** ID do TipoInsumo — preenchido quando tipoPatrimonio = INSUMO */
  tipoInsumoId?: string
  /** Quantidade de unidades solicitadas — preenchido quando tipoPatrimonio = INSUMO */
  quantidade?: number
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
  get patrimonioId(): string | undefined { return this.props.patrimonioId }
  get tipoInsumoId(): string | undefined { return this.props.tipoInsumoId }
  get quantidade(): number | undefined { return this.props.quantidade }
  get associadoId(): string { return this.props.associadoId }
  get justificativa(): string | undefined { return this.props.justificativa }
  get status(): StatusSolicitacaoPatrimonio { return this.props.status }
  get criadoEm(): Date { return this.props.criadoEm }
  get resolvidoEm(): Date | undefined { return this.props.resolvidoEm }

  isEquipamento(): boolean {
    return this.props.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO
  }

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
