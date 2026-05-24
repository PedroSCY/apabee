import { StatusAssociado } from '@apa/shared'
import { Usuario } from './Usuario'

interface AssociadoProps {
  id: string
  usuario: Usuario
  cpf?: string
  dataIngresso: Date
  observacoes?: string
  status: StatusAssociado
  isentoMensalidade?: boolean
  deletadoEm?: Date
}

/** Membro da associação (APA). Vinculado 1:1 a um Usuario com role ASSOCIADO. Gerencia o ciclo de vida: pendente, ativo, suspenso, inativo. */
export class Associado {
  private readonly props: AssociadoProps

  constructor(props: AssociadoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get usuario(): Usuario { return this.props.usuario }
  get cpf(): string | undefined { return this.props.cpf }
  get nome(): string { return this.props.usuario.nome }
  get email(): string { return this.props.usuario.email }
  get dataIngresso(): Date { return this.props.dataIngresso }
  get observacoes(): string | undefined { return this.props.observacoes }
  get status(): StatusAssociado { return this.props.status }
  get isentoMensalidade(): boolean { return this.props.isentoMensalidade ?? false }
  get deletadoEm(): Date | undefined { return this.props.deletadoEm }

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

  /** Marca isenção estrutural — não receberá mensalidades em batches futuros. */
  marcarIsento(): Associado { return new Associado({ ...this.props, isentoMensalidade: true }) }

  /** Remove isenção estrutural — volta a receber mensalidades em batches futuros. */
  removerIsencao(): Associado { return new Associado({ ...this.props, isentoMensalidade: false }) }

  /** Retorna nova instância com os campos fornecidos atualizados. */
  atualizarDados(dados: { status?: StatusAssociado; dataIngresso?: Date; observacoes?: string; cpf?: string }): Associado {
    return new Associado({ ...this.props, ...dados })
  }

  toJSON(): AssociadoProps { return { ...this.props } }
}
