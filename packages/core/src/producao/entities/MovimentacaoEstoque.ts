import { TipoMovimentacao } from '@apa/shared';

interface MovimentacaoEstoqueProps {
  id: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  referenciaId: string;
  criadoEm: Date;
}

export class MovimentacaoEstoque {
  private readonly props: MovimentacaoEstoqueProps;

  constructor(props: MovimentacaoEstoqueProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get tipo(): TipoMovimentacao { return this.props.tipo; }
  get quantidade(): number { return this.props.quantidade; }
  get referenciaId(): string { return this.props.referenciaId; }
  get criadoEm(): Date { return this.props.criadoEm; }

  isEntrada(): boolean {
    return this.props.tipo === TipoMovimentacao.ENTRADA;
  }

  descrever(): string {
    const acao = this.isEntrada() ? 'Entrada' : 'Saída';
    return `${acao} de ${this.props.quantidade} unidades — ref: ${this.props.referenciaId}`;
  }
}
