import { StatusAtribuicao, TipoPatrimonio } from '@apa/shared'

interface AtribuicaoPatrimonioProps {
  id: string
  patrimonioId: string
  tipoPatrimonio: TipoPatrimonio;
  associadoId: string
  dataInicio: Date
  dataFim?: Date
  status: StatusAtribuicao
  observacao?: string
}

export class AtribuicaoPatrimonio {
  private readonly props: AtribuicaoPatrimonioProps

  constructor(props: AtribuicaoPatrimonioProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }
  get insumoId(): string {
    return this.props.patrimonioId
  }
  get associadoId(): string {
    return this.props.associadoId
  }
  get dataInicio(): Date {
    return this.props.dataInicio
  }
  get dataFim(): Date | undefined {
    return this.props.dataFim
  }
  get status(): StatusAtribuicao {
    return this.props.status
  }
  get observacao(): string | undefined {
    return this.props.observacao
  }

  estaAtiva(): boolean {
    return this.props.status === StatusAtribuicao.ATIVO
  }

    isEquipamento(): boolean {
    return this.props.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO;
  }

  isInsumo(): boolean {
    return this.props.tipoPatrimonio === TipoPatrimonio.INSUMO;
  }

  devolver(): AtribuicaoPatrimonio {
    if (!this.estaAtiva()) {
      throw new Error('Atribuição já foi devolvida.')
    }
    return new AtribuicaoPatrimonio({
      ...this.props,
      status: StatusAtribuicao.DEVOLVIDO,
      dataFim: new Date(),
    })
  }

  duracaoEmDias(): number {
    const fim = this.props.dataFim ?? new Date()
    const diff = fim.getTime() - this.props.dataInicio.getTime()
    return Math.floor(diff / 86_400_000)
  }

  toJSON(): AtribuicaoPatrimonioProps {
    return { ...this.props }
  }
}
