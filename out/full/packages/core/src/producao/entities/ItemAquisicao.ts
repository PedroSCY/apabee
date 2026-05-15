import { TipoDestinoAquisicao } from '@apa/shared'

interface ItemAquisicaoProps {
  id: string
  campanhaId: string
  descricao: string
  quantidade: number
  valorEstimado: number
  tipoDestino: TipoDestinoAquisicao
  equipamentoNome?: string
  tipoMateriaPrimaId?: string
  criadoEm: Date
}

/** Item planejado para aquisição coletiva. Define o que será comprado e como será distribuído após a compra. */
export class ItemAquisicao {
  private readonly props: ItemAquisicaoProps

  constructor(props: ItemAquisicaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get descricao(): string { return this.props.descricao }
  get quantidade(): number { return this.props.quantidade }
  get valorEstimado(): number { return this.props.valorEstimado }
  get tipoDestino(): TipoDestinoAquisicao { return this.props.tipoDestino }
  get equipamentoNome(): string | undefined { return this.props.equipamentoNome }
  get tipoMateriaPrimaId(): string | undefined { return this.props.tipoMateriaPrimaId }
  get criadoEm(): Date { return this.props.criadoEm }

  atualizar(dados: { descricao?: string; quantidade?: number; valorEstimado?: number; tipoDestino?: TipoDestinoAquisicao; equipamentoNome?: string; tipoMateriaPrimaId?: string }): ItemAquisicao {
    return new ItemAquisicao({ ...this.props, ...dados })
  }

  valorTotal(): number {
    return this.props.quantidade * this.props.valorEstimado
  }

  toJSON() { return { ...this.props } }
}
