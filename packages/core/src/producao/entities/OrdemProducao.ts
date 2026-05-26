import { StatusOrdemProducao } from '@apa/shared'

export interface MaterialConsumido {
  tipoMateriaPrimaId: string
  quantidade: number
}

interface OrdemProducaoProps {
  id: string
  campanhaId: string
  produtoId: string
  quantidade: number
  status: StatusOrdemProducao
  perdaPercentual: number
  quantidadeReal?: number
  sobrasRecuperadas?: number
  observacao?: string
  produtosGerados?: number
  materiaisConsumidos: MaterialConsumido[]
  criadoEm: Date
  confirmadoEm?: Date
}

/** Instrução de transformar matéria-prima em produto. Criada como RASCUNHO (planejamento), confirmada para CONCLUIDA (execução real). */
export class OrdemProducao {
  private readonly props: OrdemProducaoProps

  constructor(props: OrdemProducaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get produtoId(): string { return this.props.produtoId }
  get quantidade(): number { return this.props.quantidade }
  get status(): StatusOrdemProducao { return this.props.status }
  get perdaPercentual(): number { return this.props.perdaPercentual }
  get quantidadeReal(): number | undefined { return this.props.quantidadeReal }
  get sobrasRecuperadas(): number | undefined { return this.props.sobrasRecuperadas }
  get observacao(): string | undefined { return this.props.observacao }
  get produtosGerados(): number | undefined { return this.props.produtosGerados }
  get materiaisConsumidos(): MaterialConsumido[] { return this.props.materiaisConsumidos }
  get criadoEm(): Date { return this.props.criadoEm }
  get confirmadoEm(): Date | undefined { return this.props.confirmadoEm }

  estaRascunho(): boolean { return this.props.status === StatusOrdemProducao.RASCUNHO }

  /** Calcula o consumo estimado de uma matéria-prima incluindo a perda esperada. */
  calcularConsumoReal(quantidadeBase: number): number {
    return quantidadeBase * (1 + this.props.perdaPercentual / 100)
  }

  confirmar(
    quantidadeReal: number,
    materiaisConsumidos: MaterialConsumido[],
    sobrasRecuperadas?: number,
    observacao?: string,
  ): OrdemProducao {
    if (this.props.status !== StatusOrdemProducao.RASCUNHO)
      throw new Error('Apenas ordens em RASCUNHO podem ser confirmadas')
    return new OrdemProducao({
      ...this.props,
      status: StatusOrdemProducao.CONCLUIDA,
      quantidadeReal,
      produtosGerados: quantidadeReal,
      materiaisConsumidos,
      sobrasRecuperadas,
      observacao,
      confirmadoEm: new Date(),
    })
  }

  /** Reverte a ordem para RASCUNHO, limpando todos os dados de confirmação (imutável). */
  estornar(): OrdemProducao {
    if (this.props.status !== StatusOrdemProducao.CONCLUIDA)
      throw new Error('Apenas ordens CONCLUIDAS podem ser estornadas')
    return new OrdemProducao({
      ...this.props,
      status: StatusOrdemProducao.RASCUNHO,
      quantidadeReal: undefined,
      produtosGerados: undefined,
      sobrasRecuperadas: undefined,
      observacao: undefined,
      confirmadoEm: undefined,
      materiaisConsumidos: [],
    })
  }

  toJSON() { return { ...this.props } }
}
