import { TipoMovimentacao } from '@apa/shared'

interface MovimentacaoEstoqueCampanhaProps {
  id: string
  estoqueCampanhaId: string
  tipo: TipoMovimentacao
  quantidade: number
  referenciaId?: string
  criadoEm: Date
}

/** Movimentação (entrada/saída) no estoque dedicado de uma campanha. */
export class MovimentacaoEstoqueCampanha {
  private readonly props: MovimentacaoEstoqueCampanhaProps

  constructor(props: MovimentacaoEstoqueCampanhaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get estoqueCampanhaId(): string { return this.props.estoqueCampanhaId }
  get tipo(): TipoMovimentacao { return this.props.tipo }
  get quantidade(): number { return this.props.quantidade }
  get referenciaId(): string | undefined { return this.props.referenciaId }
  get criadoEm(): Date { return this.props.criadoEm }

  isEntrada(): boolean {
    return this.props.tipo === TipoMovimentacao.ENTRADA
  }

}
