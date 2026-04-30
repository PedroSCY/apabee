interface EquipamentoProps {
  id: string;
  nome: string;
  numeroSerie?: string;
  descricao?: string;
  emUso: boolean;
  criadoEm: Date;
}

export class Equipamento {
  private readonly props: EquipamentoProps;

  constructor(props: EquipamentoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get nome(): string { return this.props.nome; }
  get numeroSerie(): string | undefined { return this.props.numeroSerie; }
  get descricao(): string | undefined { return this.props.descricao; }
  get emUso(): boolean { return this.props.emUso; }
  get criadoEm(): Date { return this.props.criadoEm; }

  estaDisponivel(): boolean {
    return !this.props.emUso;
  }

  marcarEmUso(): Equipamento {
    return new Equipamento({ ...this.props, emUso: true });
  }

  marcarDisponivel(): Equipamento {
    return new Equipamento({ ...this.props, emUso: false });
  }
}
