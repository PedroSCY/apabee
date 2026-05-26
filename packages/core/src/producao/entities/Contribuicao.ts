import { TipoContribuicao } from '@apa/shared'

interface ContribuicaoProps {
  id: string
  campanhaId: string
  /** null = contribuição da própria associação (ex: alocação do pool) */
  associadoId: string | null
  tipo: TipoContribuicao
  /** Valor monetário (R$). Para COLHEITA: volume × preço referência. Para DINHEIRO: valor direto. */
  valorMonetario: number
  // COLHEITA
  colheitaId?: string
  volume?: number
  tipoMateriaPrimaId?: string
  descricao?: string
  liquidado: boolean
  criadoEm: Date
}

/** Contribuição de um associado a uma campanha. COLHEITA para campanhas de produção; DINHEIRO para campanhas de aquisição. */
export class Contribuicao {
  private readonly props: ContribuicaoProps

  constructor(props: ContribuicaoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get campanhaId(): string { return this.props.campanhaId }
  get associadoId(): string | null { return this.props.associadoId }
  get tipo(): TipoContribuicao { return this.props.tipo }
  get valorMonetario(): number { return this.props.valorMonetario }
  get colheitaId(): string | undefined { return this.props.colheitaId }
  get volume(): number | undefined { return this.props.volume }
  get tipoMateriaPrimaId(): string | undefined { return this.props.tipoMateriaPrimaId }
  get descricao(): string | undefined { return this.props.descricao }
  get liquidado(): boolean { return this.props.liquidado }
  get criadoEm(): Date { return this.props.criadoEm }

  atualizar(dados: { valorMonetario?: number; descricao?: string }): Contribuicao {
    return new Contribuicao({ ...this.props, ...dados })
  }

  marcarLiquidado(): Contribuicao {
    return new Contribuicao({ ...this.props, liquidado: true })
  }

  toJSON() { return { ...this.props } }
}
