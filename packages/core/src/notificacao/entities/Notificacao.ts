import { TipoNotificacao } from '@apa/shared'

interface NotificacaoProps {
  id: string
  userId: string
  tipo: TipoNotificacao
  titulo: string
  corpo?: string
  dadosExtras?: Record<string, unknown>
  lida: boolean
  criadoEm: Date
}

export class Notificacao {
  private readonly props: NotificacaoProps

  constructor(props: NotificacaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get tipo(): TipoNotificacao { return this.props.tipo }
  get titulo(): string { return this.props.titulo }
  get corpo(): string | undefined { return this.props.corpo }
  get dadosExtras(): Record<string, unknown> | undefined { return this.props.dadosExtras }
  get lida(): boolean { return this.props.lida }
  get criadoEm(): Date { return this.props.criadoEm }

  marcarLida(): Notificacao {
    return new Notificacao({ ...this.props, lida: true })
  }
}
