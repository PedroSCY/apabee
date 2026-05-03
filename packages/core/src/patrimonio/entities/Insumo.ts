import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'

interface InsumoProps {
  id: string
  nome: string
  categoria: CategoriaInsumo
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
  get nome(): string { return this.props.nome }
  get categoria(): CategoriaInsumo { return this.props.categoria }
  get descricao(): string | undefined { return this.props.descricao }
  get status(): StatusPatrimonio { return this.props.status }
  get criadoEm(): Date { return this.props.criadoEm }

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
}
