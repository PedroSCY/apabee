import { DestinatarioCampanha, StatusCampanha, TipoLote } from '@apa/shared'

interface CampanhaProps {
  id: string
  codigo: string
  nome: string
  tipo: TipoLote
  safraId?: string
  dataInicio: Date
  dataFim?: Date
  status: StatusCampanha
  // apenas AQUISICAO
  destinatario?: DestinatarioCampanha
  valorMeta?: number
  prazoContribuicao?: Date
  valorMinimo?: number
  valorMaximo?: number
  // financeiro
  receitaTotal: number
  custoTotal: number
  criadoEm: Date
}

/** Campanha coletiva — produção (mel, cera) ou aquisição (compra em grupo). Substitui LoteProducao no novo modelo. */
export class Campanha {
  private readonly props: CampanhaProps

  constructor(props: CampanhaProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get codigo(): string { return this.props.codigo }
  get nome(): string { return this.props.nome }
  get tipo(): TipoLote { return this.props.tipo }
  get safraId(): string | undefined { return this.props.safraId }
  get dataInicio(): Date { return this.props.dataInicio }
  get dataFim(): Date | undefined { return this.props.dataFim }
  get status(): StatusCampanha { return this.props.status }
  get valorMeta(): number | undefined { return this.props.valorMeta }
  get prazoContribuicao(): Date | undefined { return this.props.prazoContribuicao }
  get valorMinimo(): number | undefined { return this.props.valorMinimo }
  get destinatario(): DestinatarioCampanha | undefined { return this.props.destinatario }
  get valorMaximo(): number | undefined { return this.props.valorMaximo }
  get receitaTotal(): number { return this.props.receitaTotal }
  get custoTotal(): number { return this.props.custoTotal }
  get criadoEm(): Date { return this.props.criadoEm }

  get isAquisicaoIndividual(): boolean {
    return this.props.tipo === TipoLote.AQUISICAO && this.props.destinatario === DestinatarioCampanha.INDIVIDUAL
  }

  estaAtiva(): boolean { return this.props.status === StatusCampanha.ATIVA }
  estaConcluida(): boolean { return this.props.status === StatusCampanha.CONCLUIDA }
  estaLiquidada(): boolean { return this.props.status === StatusCampanha.LIQUIDADA }
  estaCancelada(): boolean { return this.props.status === StatusCampanha.CANCELADA }

  iniciar(): Campanha {
    if (this.props.status !== StatusCampanha.PLANEJADA)
      throw new Error('Apenas campanhas PLANEJADAS podem ser iniciadas')
    return new Campanha({ ...this.props, status: StatusCampanha.ATIVA })
  }

  concluir(): Campanha {
    if (this.props.status !== StatusCampanha.ATIVA)
      throw new Error('Apenas campanhas ATIVAS podem ser concluídas')
    return new Campanha({ ...this.props, status: StatusCampanha.CONCLUIDA, dataFim: new Date() })
  }

  comReceita(receitaTotal: number): Campanha {
    if (this.props.status !== StatusCampanha.CONCLUIDA)
      throw new Error('Receita total só pode ser informada em campanhas CONCLUIDAS')
    return new Campanha({ ...this.props, receitaTotal })
  }

  comCustoTotal(custoTotal: number): Campanha {
    return new Campanha({ ...this.props, custoTotal })
  }

  liquidar(receitaTotal: number, custoTotal: number): Campanha {
    if (this.props.status !== StatusCampanha.CONCLUIDA)
      throw new Error('Apenas campanhas CONCLUIDAS podem ser liquidadas')
    return new Campanha({ ...this.props, status: StatusCampanha.LIQUIDADA, receitaTotal, custoTotal })
  }

  cancelar(): Campanha {
    if (this.props.status === StatusCampanha.LIQUIDADA)
      throw new Error('Campanha liquidada não pode ser cancelada')
    if (this.props.status === StatusCampanha.CANCELADA)
      throw new Error('Campanha já está cancelada')
    return new Campanha({ ...this.props, status: StatusCampanha.CANCELADA })
  }

  toJSON() { return { ...this.props } }
}
