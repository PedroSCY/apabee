import { RegraAcordo, TipoContribuicao } from '@apa/shared'

interface ContribuicaoProps {
  id: string
  campanhaId: string
  associadoId: string
  tipo: TipoContribuicao
  /** Valor monetário (R$) convertido de qualquer tipo de contribuição. Para ACORDO, populado na liquidação. */
  valorMonetario: number
  // COLHEITA
  colheitaId?: string
  volume?: number
  tipoMateriaPrimaId?: string
  // MAO_DE_OBRA
  horas?: number
  // ACORDO
  regraCalculo?: RegraAcordo
  regraParametro?: number
  descricao?: string
  liquidado: boolean
  criadoEm: Date
}

/** Contribuição de um associado a uma campanha. Tudo é convertido a valorMonetario (R$) para rateio na liquidação (RN17). */
export class Contribuicao {
  private readonly props: ContribuicaoProps

  constructor(props: ContribuicaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get associadoId(): string { return this.props.associadoId }
  get tipo(): TipoContribuicao { return this.props.tipo }
  get valorMonetario(): number { return this.props.valorMonetario }
  get colheitaId(): string | undefined { return this.props.colheitaId }
  get volume(): number | undefined { return this.props.volume }
  get tipoMateriaPrimaId(): string | undefined { return this.props.tipoMateriaPrimaId }
  get horas(): number | undefined { return this.props.horas }
  get regraCalculo(): RegraAcordo | undefined { return this.props.regraCalculo }
  get regraParametro(): number | undefined { return this.props.regraParametro }
  get descricao(): string | undefined { return this.props.descricao }
  get liquidado(): boolean { return this.props.liquidado }
  get criadoEm(): Date { return this.props.criadoEm }

  atualizar(dados: { valorMonetario?: number; horas?: number; descricao?: string }): Contribuicao {
    return new Contribuicao({ ...this.props, ...dados })
  }

  /** Preenche o valorMonetario de um ACORDO calculado na liquidação. */
  resolverAcordo(valor: number): Contribuicao {
    if (this.props.tipo !== TipoContribuicao.ACORDO)
      throw new Error('resolverAcordo só se aplica a contribuições do tipo ACORDO')
    return new Contribuicao({ ...this.props, valorMonetario: valor, liquidado: true })
  }

  marcarLiquidado(): Contribuicao {
    return new Contribuicao({ ...this.props, liquidado: true })
  }

  toJSON() { return { ...this.props } }
}
