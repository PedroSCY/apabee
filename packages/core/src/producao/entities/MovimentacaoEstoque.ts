import { TipoMovimentacao } from '@apa/shared';

interface MovimentacaoEstoqueProps {
  id: string;
  estoqueId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  referenciaId?: string;
  criadoEm: Date;
}

/** Movimentação (entrada/saída) no estoque de matéria-prima. */
export class MovimentacaoEstoque {
  private readonly props: MovimentacaoEstoqueProps;

  constructor(props: MovimentacaoEstoqueProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get estoqueId(): string { return this.props.estoqueId; }
  get tipo(): TipoMovimentacao { return this.props.tipo; }
  get quantidade(): number { return this.props.quantidade; }
  get referenciaId(): string | undefined { return this.props.referenciaId; }
  get criadoEm(): Date { return this.props.criadoEm; }

  /** Retorna true se for movimentação de entrada. */
  isEntrada(): boolean {
    return this.props.tipo === TipoMovimentacao.ENTRADA;
  }

  /** Retorna descrição legível da movimentação. */
  descrever(): string {
    const acao = this.isEntrada() ? 'Entrada' : 'Saída';
    return `${acao} de ${this.props.quantidade} unidades — ref: ${this.props.referenciaId ?? 'N/A'}`;
  }

}
