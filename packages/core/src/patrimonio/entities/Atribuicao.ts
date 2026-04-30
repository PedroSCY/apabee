import { StatusAtribuicao } from "@repo/shared";

interface AtribuicaoProps {
  id: string;
  patrimonioId: string;
  associadoId: string;
  dataInicio: Date;
  dataFim?: Date;
  status: StatusAtribuicao;
  observacao?: string;
}

export class Atribuicao {
  private readonly props: AtribuicaoProps;

  constructor(props: AtribuicaoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get insumoId(): string { return this.props.patrimonioId; }
  get associadoId(): string { return this.props.associadoId; }
  get dataInicio(): Date { return this.props.dataInicio; }
  get dataFim(): Date | undefined { return this.props.dataFim; }
  get status(): StatusAtribuicao { return this.props.status; }
  get observacao(): string | undefined { return this.props.observacao; }

  estaAtiva(): boolean {
    return this.props.status === StatusAtribuicao.ATIVO;
  }

  devolver(): Atribuicao {
    if (!this.estaAtiva()) {
      throw new Error('Atribuição já foi devolvida.');
    }
    return new Atribuicao({
      ...this.props,
      status: StatusAtribuicao.DEVOLVIDO,
      dataFim: new Date(),
    });
  }

  duracaoEmDias(): number {
    const fim = this.props.dataFim ?? new Date();
    const diff = fim.getTime() - this.props.dataInicio.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
