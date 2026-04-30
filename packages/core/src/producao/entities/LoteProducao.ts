import { TipoLote } from '@apa/shared'

interface LoteProducaoProps {
  id: string
  tipo: TipoLote
  periodo: string
  dataInicio: Date
  dataFim?: Date
  ativo: boolean
  custoTotal: number
}

export class LoteProducao {
  private readonly props: LoteProducaoProps

  constructor(props: LoteProducaoProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get tipo(): TipoLote {
    return this.props.tipo
  }
  get periodo(): string {
    return this.props.periodo
  }
  get dataInicio(): Date {
    return this.props.dataInicio
  }
  get dataFim(): Date | undefined {
    return this.props.dataFim
  }
  get ativo(): boolean {
    return this.props.ativo
  }
  get custoTotal(): number {
    return this.props.custoTotal
  }

  estaAberto(): boolean {
    return this.props.ativo
  }

  encerrar(): LoteProducao {
    if (!this.estaAberto()) {
      throw new Error('Lote já está encerrado.')
    }
    return new LoteProducao({
      ...this.props,
      ativo: false,
      dataFim: new Date(),
    })
  }
}
