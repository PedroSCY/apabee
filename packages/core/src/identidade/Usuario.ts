import { RoleUsuario } from '@apa/shared'
import { Email } from './value-objects/Email'
import { Entity } from '../shared/Entity'
import { DomainError } from '../shared/DomainError'

interface UsuarioProps {
  nome: string
  email: Email
  role: RoleUsuario
  telefone?: string
  ativo: boolean
  criadoEm: Date
}

export class Usuario extends Entity<UsuarioProps> {
  private constructor(props: UsuarioProps, id?: string) {
    super(props, id)
  }

  static create(
    params: {
      nome: string
      email: string
      role: RoleUsuario
      telefone?: string
    },
    id?: string,
  ): Usuario {
    if (!params.nome.trim()) {
      throw new DomainError('Nome do usuário não pode ser vazio')
    }
    return new Usuario(
      {
        nome: params.nome.trim(),
        email: Email.create(params.email),
        role: params.role,
        telefone: params.telefone,
        ativo: true,
        criadoEm: new Date(),
      },
      id,
    )
  }

  get nome(): string {
    return this.props.nome
  }
  get email(): string {
    return this.props.email.value
  }
  get role(): RoleUsuario {
    return this.props.role
  }
  get telefone(): string | undefined {
    return this.props.telefone
  }
  get ativo(): boolean {
    return this.props.ativo
  }
  get criadoEm(): Date {
    return this.props.criadoEm
  }

  isAdmin(): boolean {
    return this.props.role === RoleUsuario.ADMIN
  }

  isAssociado(): boolean {
    return this.props.role === RoleUsuario.ASSOCIADO
  }

  ativar(): void {
    this.props.ativo = true
  }

  desativar(): void {
    if (this.props.role === RoleUsuario.ADMIN) {
      throw new DomainError('Não é possível desativar um administrador')
    }
    this.props.ativo = false
  }

  alterarRole(role: RoleUsuario): void {
    this.props.role = role
  }
}
