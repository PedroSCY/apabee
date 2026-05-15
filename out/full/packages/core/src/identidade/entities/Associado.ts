import { StatusAssociado } from '@apa/shared'
import { Usuario } from './Usuario'

interface AssociadoProps {
  id: string
  usuario: Usuario
  dataIngresso: Date
  observacoes?: string
  status: StatusAssociado
}

/** Membro da associação (APA). Vinculado 1:1 a um Usuario com role ASSOCIADO. Gerencia o ciclo de vida: pendente, ativo, suspenso, inativo. */
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

  /** Retorna true se o associado está ATIVO. */
  isAtivo(): boolean { return this.props.status === StatusAssociado.ATIVO }

  /** Retorna nova instância com status ATIVO. */
  ativar(): Associado { return new Associado({ ...this.props, status: StatusAssociado.ATIVO }) }

  /** Retorna nova instância com status SUSPENSO. */
  suspender(): Associado { return new Associado({ ...this.props, status: StatusAssociado.SUSPENSO }) }

  /** Retorna nova instância com status INATIVO. */
  inativar(): Associado { return new Associado({ ...this.props, status: StatusAssociado.INATIVO }) }

  /** Retorna nova instância com status PENDENTE. */
  marcarPendente(): Associado { return new Associado({ ...this.props, status: StatusAssociado.PENDENTE }) }

  /** Retorna nova instância com os campos fornecidos atualizados. */
  atualizarDados(dados: { status?: StatusAssociado; dataIngresso?: Date; observacoes?: string }): Associado {
    return new Associado({ ...this.props, ...dados })
  }

  toJSON(): AssociadoProps { return { ...this.props } }
}
