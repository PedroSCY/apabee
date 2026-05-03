import { StatusAssociado } from '@apa/shared'
import { Usuario } from './Usuario'

interface AssociadoProps {
  id: string
  usuario: Usuario
  dataIngresso: Date
  observacoes?: string
  status: StatusAssociado
}

export class Associado {
  private readonly props: AssociadoProps

  constructor(props: AssociadoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get usuario(): Usuario { return this.props.usuario }
  get nome(): string { return this.props.usuario.nome }
  get email(): string { return this.props.usuario.email }
  get dataIngresso(): Date { return this.props.dataIngresso }
  get observacoes(): string | undefined { return this.props.observacoes }
  get status(): StatusAssociado { return this.props.status }

  isAtivo(): boolean {
    return this.props.status === StatusAssociado.ATIVO
  }

  ativar(): Associado {
    return new Associado({ ...this.props, status: StatusAssociado.ATIVO })
  }

  suspender(): Associado {
    return new Associado({ ...this.props, status: StatusAssociado.SUSPENSO })
  }

  inativar(): Associado {
    return new Associado({ ...this.props, status: StatusAssociado.INATIVO })
  }

  marcarPendente(): Associado {
    return new Associado({ ...this.props, status: StatusAssociado.PENDENTE })
  }
}
