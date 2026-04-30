import {TipoVenda} from "@apa/shared"

interface VendaProps {
  id: string;
  loteProducaoId: string;
  associadoId?: string;
  tipo: TipoVenda;
  volume: number;
  valor: number;
  data: Date;
}

export class Venda {
  private readonly props: VendaProps;

  constructor(props: VendaProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get loteProducaoId(): string { return this.props.loteProducaoId; }
  get associadoId(): string | undefined { return this.props.associadoId; }
  get tipo(): TipoVenda { return this.props.tipo; }
  get volume(): number { return this.props.volume; }
  get valor(): number { return this.props.valor; }
  get data(): Date { return this.props.data; }

  isIndividual(): boolean {
    return this.props.tipo === TipoVenda.INDIVIDUAL;
  }

  // RN11: venda individual deve gerar antecipação — validação de pré-condição
  validarIndividual(): void {
    if (this.isIndividual() && !this.props.associadoId) {
      throw new Error('Venda individual requer associadoId.');
    }
  }
}
