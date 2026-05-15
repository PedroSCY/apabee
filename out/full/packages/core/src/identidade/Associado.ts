import { DomainError } from "../shared/DomainError"
import { Entity } from "../shared/Entity"
import { Usuario } from "./Usuario"

interface AssociadoProps {
  usuario: Usuario
  dataIngresso: Date
  observacoes?: string
}

export class Associado extends Entity<AssociadoProps> {
  private constructor(props: AssociadoProps, id?: string) {
    super(props, id)
  }

  static create(
    params: {
      usuario: Usuario
      dataIngresso?: Date
      observacoes?: string
    },
    id?: string,
  ): Associado {
    if (!params.usuario.isAssociado()) {
      throw new DomainError('Usuário deve ter role ASSOCIADO para ser um Associado')
    }
    return new Associado(
      {
        usuario: params.usuario,
        dataIngresso: params.dataIngresso ?? new Date(),
        observacoes: params.observacoes,
      },
      id,
    )
  }

  get usuario(): Usuario { return this.props.usuario }
  get nome(): string { return this.props.usuario.nome }
  get email(): string { return this.props.usuario.email }
  get dataIngresso(): Date { return this.props.dataIngresso }
  get observacoes(): string | undefined { return this.props.observacoes }
  get ativo(): boolean { return this.props.usuario.ativo }

  estaAtivo(): boolean {
    return this.props.usuario.ativo
  }

  atualizarObservacoes(observacoes: string): void {
    this.props.observacoes = observacoes
  }
}
