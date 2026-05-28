import { UnidadeMedida } from '@apa/shared'

interface EstoqueCampanhaProps {
  id: string
  campanhaId: string
  tipoMateriaPrimaId: string
  quantidadeDisponivel: number
  unidade: UnidadeMedida
  atualizadoEm: Date
}

/** Saldo de matéria-prima dedicado a uma campanha específica. */
export class EstoqueCampanha {
  private readonly props: EstoqueCampanhaProps

  constructor(props: EstoqueCampanhaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get tipoMateriaPrimaId(): string { return this.props.tipoMateriaPrimaId }
  get quantidadeDisponivel(): number { return this.props.quantidadeDisponivel }
  get unidade(): UnidadeMedida { return this.props.unidade }
  get atualizadoEm(): Date { return this.props.atualizadoEm }

  temSaldo(qtd: number): boolean {
    return this.props.quantidadeDisponivel >= qtd
  }

  /** Adiciona quantidade ao estoque da campanha (imutável). */
  entrada(qtd: number): EstoqueCampanha {
    if (qtd <= 0) throw new Error('Quantidade deve ser positiva.')
    return new EstoqueCampanha({
      ...this.props,
      quantidadeDisponivel: this.props.quantidadeDisponivel + qtd,
      atualizadoEm: new Date(),
    })
  }

  /** Remove quantidade do estoque da campanha (imutável). */
  saida(qtd: number): EstoqueCampanha {
    if (qtd <= 0) throw new Error('Quantidade deve ser positiva.')
    if (!this.temSaldo(qtd)) throw new Error('Saldo insuficiente no estoque da campanha.')
    return new EstoqueCampanha({
      ...this.props,
      quantidadeDisponivel: this.props.quantidadeDisponivel - qtd,
      atualizadoEm: new Date(),
    })
  }

}
