import { UnidadeMedida } from '@apa/shared'

interface ColheitaProps {
  id: string
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  loteProducaoId: string
  volume: number
  unidade: UnidadeMedida
  dataColheita: Date
  observacao?: string
  criadoEm: Date
}

/** Registro de colheita de matéria-prima por um associado. */
export class Colheita {
  private readonly props: ColheitaProps

  constructor(props: ColheitaProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get associadoId(): string {
    return this.props.associadoId
  }
  get tipoMateriaPrimaId(): string {
    return this.props.tipoMateriaPrimaId
  }
  get equipamentoId(): string | undefined {
    return this.props.equipamentoId
  }
  get loteProducaoId(): string {
    return this.props.loteProducaoId
  }
  get volume(): number {
    return this.props.volume
  }
  get unidade(): UnidadeMedida {
    return this.props.unidade
  }
  get dataColheita(): Date {
    return this.props.dataColheita
  }
  get observacao(): string | undefined {
    return this.props.observacao
  }
  get criadoEm(): Date {
    return this.props.criadoEm
  }

  /** Valida se os dados da colheita são consistentes. */
  validar(): boolean {
    return this.props.volume > 0
  }

  toJSON() { return { ...this.props } }
}
