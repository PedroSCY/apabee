import { StatusSafra } from '@apa/shared'

interface SafraProps {
  id: string
  nome: string
  floradaId: string
  floradaNome?: string
  dataInicio: Date
  dataFim?: Date
  status: StatusSafra
}

/** Safra apícola — período sazonal de uma florada. Define o contexto de qualidade e precificação das colheitas. */
export class Safra {
  private readonly props: SafraProps

  constructor(props: SafraProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get floradaId(): string { return this.props.floradaId }
  get floradaNome(): string | undefined { return this.props.floradaNome }
  get dataInicio(): Date { return this.props.dataInicio }
  get dataFim(): Date | undefined { return this.props.dataFim }
  get status(): StatusSafra { return this.props.status }

  atualizar(dados: { nome?: string; dataFim?: Date }): Safra {
    return new Safra({ ...this.props, ...dados })
  }

  estaEmAndamento(): boolean {
    return this.props.status === StatusSafra.EM_ANDAMENTO
  }

  iniciar(): Safra {
    if (this.props.status !== StatusSafra.PLANEJADA)
      throw new Error('Apenas safras PLANEJADAS podem ser iniciadas')
    return new Safra({ ...this.props, status: StatusSafra.EM_ANDAMENTO })
  }

  encerrar(): Safra {
    if (this.props.status !== StatusSafra.EM_ANDAMENTO)
      throw new Error('Apenas safras EM_ANDAMENTO podem ser encerradas')
    return new Safra({ ...this.props, status: StatusSafra.ENCERRADA, dataFim: new Date() })
  }

}
