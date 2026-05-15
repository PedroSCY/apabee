export interface RateioCampanha {
  associadoId: string
  contribuicaoTotal: number
  percentual: number
  valorBruto: number
  custosRateados: number
  antecipacoes: number
  valorFinal: number
}

interface ApuracaoCampanhaProps {
  id: string
  campanhaId: string
  faturamentoTotal: number
  custoTotal: number
  lucroLiquido: number
  liquidadoEm: Date
  rateios: RateioCampanha[]
}

/** Resultado financeiro consolidado de uma campanha liquidada. Gerado automaticamente em CONCLUIDA → LIQUIDADA (RN26). */
export class ApuracaoCampanha {
  private readonly props: ApuracaoCampanhaProps

  constructor(props: ApuracaoCampanhaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get faturamentoTotal(): number { return this.props.faturamentoTotal }
  get custoTotal(): number { return this.props.custoTotal }
  get lucroLiquido(): number { return this.props.lucroLiquido }
  get liquidadoEm(): Date { return this.props.liquidadoEm }
  get rateios(): RateioCampanha[] { return this.props.rateios }

  getRateioPorAssociado(associadoId: string): RateioCampanha | undefined {
    return this.props.rateios.find(r => r.associadoId === associadoId)
  }

  toJSON() { return { ...this.props } }
}
