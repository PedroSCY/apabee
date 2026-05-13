import { StatusPatrimonio } from '@apa/shared'
import { TipoInsumo } from './TipoInsumo'

interface InsumoProps {
  id: string
  identificador: string
  tipoInsumoId: string
  tipoInsumo: TipoInsumo
  descricao?: string
  status: StatusPatrimonio
  criadoEm: Date
}

export class Insumo {
  private readonly props: InsumoProps

  constructor(props: InsumoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get identificador(): string { return this.props.identificador }
  get tipoInsumoId(): string { return this.props.tipoInsumoId }
  get tipoInsumo(): TipoInsumo { return this.props.tipoInsumo }
  get descricao(): string | undefined { return this.props.descricao }
  get status(): StatusPatrimonio { return this.props.status }
  get criadoEm(): Date { return this.props.criadoEm }

  get nome(): string { return this.props.tipoInsumo.nome }
  get categoria() { return this.props.tipoInsumo.categoria }

  estaDisponivel(): boolean {
    return this.props.status === StatusPatrimonio.DISPONIVEL
  }

  marcarEmUso(): Insumo {
    return new Insumo({ ...this.props, status: StatusPatrimonio.EM_USO })
  }

  marcarDisponivel(): Insumo {
    return new Insumo({ ...this.props, status: StatusPatrimonio.DISPONIVEL })
  }

  colocarEmManutencao(): Insumo {
    return new Insumo({ ...this.props, status: StatusPatrimonio.MANUTENCAO })
  }

  atualizarDescricao(descricao?: string): Insumo {
    return new Insumo({ ...this.props, descricao })
  }

  toJSON(): InsumoProps {
    return { ...this.props }
  }
}
