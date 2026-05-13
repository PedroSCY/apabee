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

/** Entidade que representa uma venda de produção (individual ou coletiva). */
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

  /** Verifica se a venda é do tipo individual. */
  isIndividual(): boolean {
    return this.props.tipo === TipoVenda.INDIVIDUAL;
  }

  /** Valida pré-condição da RN11: venda individual exige associadoId. */
  validarIndividual(): void {
    if (this.isIndividual() && !this.props.associadoId) {
      throw new Error('Venda individual requer associadoId.');
    }
  }
}
