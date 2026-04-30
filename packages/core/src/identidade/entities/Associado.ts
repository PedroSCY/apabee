import { Usuario } from "./usuario";


interface AssociadoProps {
  id: string;
  usuario: Usuario;
  dataIngresso: Date;
  observacoes?: string;
}

export class Associado {
  private readonly props: AssociadoProps;

  constructor(props: AssociadoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get usuario(): Usuario { return this.props.usuario; }
  get nome(): string { return this.props.usuario.nome; }
  get email(): string { return this.props.usuario.email; }
  get dataIngresso(): Date { return this.props.dataIngresso; }
  get observacoes(): string | undefined { return this.props.observacoes; }
}
