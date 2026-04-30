interface RelatorioProducaoProps {
  id: string;
  dataInicio: Date;
  dataFim: Date;
  geradoEm: Date;
}

export class RelatorioProducao {
  private readonly props: RelatorioProducaoProps;

  constructor(props: RelatorioProducaoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get dataInicio(): Date { return this.props.dataInicio; }
  get dataFim(): Date { return this.props.dataFim; }
  get geradoEm(): Date { return this.props.geradoEm; }

  periodoEmDias(): number {
    return Math.floor(
      (this.props.dataFim.getTime() - this.props.dataInicio.getTime()) / 86_400_000
    );
  }
}
