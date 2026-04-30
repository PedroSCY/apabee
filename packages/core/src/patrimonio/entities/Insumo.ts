import {CategoriaInsumo} from "@repo/shared"

interface InsumoProps {
  id: string;
  nome: string;
  categoria: CategoriaInsumo;
  descricao?: string;
  emUso: boolean;
  criadoEm: Date;
}

export class Insumo {
  private readonly props: InsumoProps;

  constructor(props: InsumoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get nome(): string { return this.props.nome; }
  get categoria(): CategoriaInsumo { return this.props.categoria; }
  get descricao(): string | undefined { return this.props.descricao; }
  get emUso(): boolean { return this.props.emUso; }
  get criadoEm(): Date { return this.props.criadoEm; }

  estaDisponivel(): boolean {
    return !this.props.emUso;
  }

  marcarEmUso(): Insumo {
    return new Insumo({ ...this.props, emUso: true });
  }

  marcarDisponivel(): Insumo {
    return new Insumo({ ...this.props, emUso: false });
  }
}
