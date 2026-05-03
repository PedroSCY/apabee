import { StatusPatrimonio } from '@apa/shared'

interface EquipamentoProps {
  id: string
  nome: string
  numeroSerie?: string
  descricao?: string
  status: StatusPatrimonio
  criadoEm: Date
}

export class Equipamento {
  private readonly props: EquipamentoProps

  constructor(props: EquipamentoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get numeroSerie(): string | undefined { return this.props.numeroSerie }
  get descricao(): string | undefined { return this.props.descricao }
  get status(): StatusPatrimonio { return this.props.status }
  get criadoEm(): Date { return this.props.criadoEm }

  estaDisponivel(): boolean {
    return this.props.status === StatusPatrimonio.DISPONIVEL
  }

  marcarEmUso(): Equipamento {
    return new Equipamento({ ...this.props, status: StatusPatrimonio.EM_USO })
  }

  marcarDisponivel(): Equipamento {
    return new Equipamento({ ...this.props, status: StatusPatrimonio.DISPONIVEL })
  }

  colocarEmManutencao(): Equipamento {
    return new Equipamento({ ...this.props, status: StatusPatrimonio.MANUTENCAO })
  }

  atualizarDados(input: { nome?: string; numeroSerie?: string; descricao?: string }): Equipamento {
    return new Equipamento({
      ...this.props,
      nome: input.nome ?? this.props.nome,
      numeroSerie: input.numeroSerie ?? this.props.numeroSerie,
      descricao: input.descricao ?? this.props.descricao,
    })
  }
}
