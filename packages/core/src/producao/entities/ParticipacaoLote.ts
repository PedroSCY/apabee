interface ParticipacaoLoteProps {
  id: string;
  loteProducaoId: string;
  associadoId: string;
  percentual: number;
  volume?: number;
  valorInvestido?: number;
}

export class ParticipacaoLote {
  private readonly props: ParticipacaoLoteProps;

  constructor(props: ParticipacaoLoteProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get loteProducaoId(): string { return this.props.loteProducaoId; }
  get associadoId(): string { return this.props.associadoId; }
  get percentual(): number { return this.props.percentual; }
  get volume(): number | undefined { return this.props.volume; }
  get valorInvestido(): number | undefined { return this.props.valorInvestido; }

  calcularDireito(faturamentoTotal: number): number {
    return (this.props.percentual / 100) * faturamentoTotal;
  }
}
