import { RoleUsuario } from "@repo/shared";

interface UsuarioProps {
  id: string;
  nome: string;
  email: string;
  role: RoleUsuario;
  ativo: boolean;
  criadoEm: Date;
}

export class Usuario {
  private readonly props: UsuarioProps;

  constructor(props: UsuarioProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get nome(): string { return this.props.nome; }
  get email(): string { return this.props.email; }
  get role(): RoleUsuario { return this.props.role; }
  get ativo(): boolean { return this.props.ativo; }
  get criadoEm(): Date { return this.props.criadoEm; }

  isAdmin(): boolean {
    return this.props.role === RoleUsuario.ADMIN;
  }

  isAssociado(): boolean {
    return this.props.role === RoleUsuario.ASSOCIADO;
  }

  ativar(): Usuario {
    return new Usuario({ ...this.props, ativo: true });
  }

  desativar(): Usuario {
    return new Usuario({ ...this.props, ativo: false });
  }

  alterarRole(role: RoleUsuario): Usuario {
    return new Usuario({ ...this.props, role });
  }
}
