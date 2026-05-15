import { StatusOrdemProducao } from '@apa/shared'
import { UnidadeMedida } from '@apa/shared'

export interface MaterialConsumido {
  tipoMateriaPrimaId: string
  quantidade: number
  unidade: UnidadeMedida
}

interface OrdemProducaoProps {
  id: string
  campanhaId: string
  produtoId: string
  quantidade: number
  status: StatusOrdemProducao
  /** Percentual de perda esperada no processamento (decantação, quebra). Consumo real = quantidade × (1 + perdaPercentual/100). */
  perdaPercentual: number
  produtosGerados?: number
  materiaisConsumidos: MaterialConsumido[]
  criadoEm: Date
  executadoEm?: Date
}

/** Instrução de transformar matéria-prima em produto, consumindo o pool e gerando EstoqueProduto. */
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
  get produtosGerados(): number | undefined { return this.props.produtosGerados }
  get materiaisConsumidos(): MaterialConsumido[] { return this.props.materiaisConsumidos }
  get criadoEm(): Date { return this.props.criadoEm }
  get executadoEm(): Date | undefined { return this.props.executadoEm }

  estaPendente(): boolean { return this.props.status === StatusOrdemProducao.PENDENTE }

  /** Calcula o consumo real de uma matéria-prima incluindo a perda esperada. */
  calcularConsumoReal(quantidadeBase: number): number {
    return quantidadeBase * (1 + this.props.perdaPercentual / 100)
  }

  iniciarExecucao(): OrdemProducao {
    if (this.props.status !== StatusOrdemProducao.PENDENTE)
      throw new Error('Apenas ordens PENDENTES podem ser executadas')
    return new OrdemProducao({ ...this.props, status: StatusOrdemProducao.EM_EXECUCAO })
  }

  concluir(produtosGerados: number, materiaisConsumidos: MaterialConsumido[]): OrdemProducao {
    if (this.props.status !== StatusOrdemProducao.EM_EXECUCAO)
      throw new Error('Apenas ordens EM_EXECUCAO podem ser concluídas')
    return new OrdemProducao({
      ...this.props,
      status: StatusOrdemProducao.CONCLUIDA,
      produtosGerados,
      materiaisConsumidos,
      executadoEm: new Date(),
    })
  }

  toJSON() { return { ...this.props } }
}
