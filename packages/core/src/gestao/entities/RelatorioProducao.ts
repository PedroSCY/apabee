/** Propriedades da entidade RelatorioProducao. */
interface RelatorioProducaoProps {
  id: string;
  dataInicio: Date;
  dataFim: Date;
  geradoEm: Date;
}

/** Relatório de produção de um período. */
export class RelatorioProducao {
  private readonly props: RelatorioProducaoProps;

  constructor(props: RelatorioProducaoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get dataInicio(): Date { return this.props.dataInicio; }
  get dataFim(): Date { return this.props.dataFim; }
  get geradoEm(): Date { return this.props.geradoEm; }

  /** Retorna a duração do período coberto em dias. */
  periodoEmDias(): number {
    return Math.floor(
      (this.props.dataFim.getTime() - this.props.dataInicio.getTime()) / 86_400_000
    );
  }
}
