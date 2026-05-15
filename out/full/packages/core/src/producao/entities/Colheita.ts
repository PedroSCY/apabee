import { UnidadeMedida } from '@apa/shared'

interface ColheitaProps {
  id: string
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  /** Campanha a que esta colheita está vinculada. Null = colheita vai direto ao pool. */
  campanhaId?: string
  /** Safra em que a colheita foi realizada (define tier de qualidade). */
  safraId?: string
  volume: number
  unidade: UnidadeMedida
  dataColheita: Date
  observacao?: string
  criadoEm: Date
}

/** Registro de colheita de matéria-prima por um associado. Colheita sem lote/campanha alimenta diretamente o pool (EstoqueMateriaPrima). */
export class Colheita {
  private readonly props: ColheitaProps

  constructor(props: ColheitaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get associadoId(): string { return this.props.associadoId }
  get tipoMateriaPrimaId(): string { return this.props.tipoMateriaPrimaId }
  get equipamentoId(): string | undefined { return this.props.equipamentoId }
  get campanhaId(): string | undefined { return this.props.campanhaId }
  get safraId(): string | undefined { return this.props.safraId }
  get volume(): number { return this.props.volume }
  get unidade(): UnidadeMedida { return this.props.unidade }
  get dataColheita(): Date { return this.props.dataColheita }
  get observacao(): string | undefined { return this.props.observacao }
  get criadoEm(): Date { return this.props.criadoEm }

  validar(): boolean {
    return this.props.volume > 0
  }

  toJSON() { return { ...this.props } }
}
