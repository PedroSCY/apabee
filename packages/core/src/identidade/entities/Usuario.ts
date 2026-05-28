import { RoleUsuario } from '@apa/shared'

interface UsuarioProps {
  id: string
  nome: string
  email: string
  telefone?: string
  role: RoleUsuario
  ativo: boolean
  criadoEm: Date
  deletadoEm?: Date
}

/** Representa um usuário do sistema com credencial no Supabase Auth. O ID é o mesmo UUID gerado pelo Supabase. */
export class Usuario {
  private readonly props: UsuarioProps

  constructor(props: UsuarioProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get email(): string { return this.props.email }
  get telefone(): string | undefined { return this.props.telefone }
  get role(): RoleUsuario { return this.props.role }
  get ativo(): boolean { return this.props.ativo }
  get criadoEm(): Date { return this.props.criadoEm }
  get deletadoEm(): Date | undefined { return this.props.deletadoEm }

  /** Retorna true se o usuário tem permissão de administrador. */
  isAdmin(): boolean { return this.props.role === RoleUsuario.ADMIN }

  /** Retorna true se o usuário é um associado comum. */
  isAssociado(): boolean { return this.props.role === RoleUsuario.ASSOCIADO }

  /** Retorna uma nova instância com ativo = true. */
  ativar(): Usuario { return new Usuario({ ...this.props, ativo: true }) }

  /** Retorna uma nova instância com ativo = false. */
  desativar(): Usuario { return new Usuario({ ...this.props, ativo: false }) }

  /** Retorna uma nova instância com a role alterada. */
  alterarRole(role: RoleUsuario): Usuario { return new Usuario({ ...this.props, role }) }

  /** Retorna uma nova instância com os campos fornecidos atualizados. */
  atualizarDados(dados: { nome?: string; email?: string; role?: RoleUsuario }): Usuario {
    return new Usuario({ ...this.props, ...dados })
  }

}
