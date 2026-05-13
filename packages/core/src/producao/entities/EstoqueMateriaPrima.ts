import { UnidadeMedida } from '@apa/shared'

interface EstoqueMateriaPrimaProps {
  id: string
  tipoMateriaPrimaId: string
  quantidadeDisponivel: number
  unidade: UnidadeMedida
  atualizadoEm: Date
}

/** Saldo disponível de um tipo de matéria-prima. */
export class EstoqueMateriaPrima {
  private readonly props: EstoqueMateriaPrimaProps

  constructor(props: EstoqueMateriaPrimaProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get tipoMateriaPrimaId(): string {
    return this.props.tipoMateriaPrimaId
  }
  get quantidadeDisponivel(): number {
    return this.props.quantidadeDisponivel
  }
  get unidade(): UnidadeMedida {
    return this.props.unidade
  }

  /** Verifica se há saldo suficiente para determinada quantidade. */
  temSaldo(qtd: number): boolean {
    return this.props.quantidadeDisponivel >= qtd
  }

  /** Adiciona quantidade ao estoque (imutável — retorna nova instância). */
  entrada(qtd: number): EstoqueMateriaPrima {
    if (qtd <= 0) throw new Error('Quantidade deve ser positiva.')
    return new EstoqueMateriaPrima({
      ...this.props,
      quantidadeDisponivel: this.props.quantidadeDisponivel + qtd,
      atualizadoEm: new Date(),
    })
  }

  /** Remove quantidade do estoque (imutável — retorna nova instância). */
  saida(qtd: number): EstoqueMateriaPrima {
    if (qtd <= 0) throw new Error('Quantidade deve ser positiva.')
    if (!this.temSaldo(qtd)) throw new Error('Saldo insuficiente em estoque.')
    return new EstoqueMateriaPrima({
      ...this.props,
      quantidadeDisponivel: this.props.quantidadeDisponivel - qtd,
      atualizadoEm: new Date(),
    })
  }

  toJSON() { return { ...this.props } }
}
