import { MetodoPagamentoMensalidade, StatusMensalidade } from '@apa/shared'
import { BadRequestException } from '@nestjs/common'

interface MensalidadeProps {
  id: string
  associadoId: string
  competenciaAno: number
  competenciaMes: number
  valor: number
  status: StatusMensalidade
  metodoPagamento?: MetodoPagamentoMensalidade
  dataPagamento?: Date
  motivoIsencao?: string
  criadoEm: Date
  cobrancaGatewayId?: string
  cobrancaLink?: string
  cobrancaStatus?: string
  cobrancaPixCopiaECola?: string
  cobrancaValorCobrado?: number
}

export class Mensalidade {
  private readonly props: MensalidadeProps

  constructor(props: MensalidadeProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get associadoId(): string { return this.props.associadoId }
  get competenciaAno(): number { return this.props.competenciaAno }
  get competenciaMes(): number { return this.props.competenciaMes }
  get valor(): number { return this.props.valor }
  get status(): StatusMensalidade { return this.props.status }
  get metodoPagamento(): MetodoPagamentoMensalidade | undefined { return this.props.metodoPagamento }
  get dataPagamento(): Date | undefined { return this.props.dataPagamento }
  get motivoIsencao(): string | undefined { return this.props.motivoIsencao }
  get criadoEm(): Date { return this.props.criadoEm }
  get cobrancaGatewayId(): string | undefined { return this.props.cobrancaGatewayId }
  get cobrancaLink(): string | undefined { return this.props.cobrancaLink }
  get cobrancaStatus(): string | undefined { return this.props.cobrancaStatus }
  get cobrancaPixCopiaECola(): string | undefined { return this.props.cobrancaPixCopiaECola }
  get cobrancaValorCobrado(): number | undefined { return this.props.cobrancaValorCobrado }

  isPendente(): boolean { return this.props.status === StatusMensalidade.PENDENTE }
  isPago(): boolean { return this.props.status === StatusMensalidade.PAGO }
  isIsento(): boolean { return this.props.status === StatusMensalidade.ISENTO }
  temCobrancaAtiva(): boolean { return !!this.props.cobrancaGatewayId }

  quitar(metodo: MetodoPagamentoMensalidade): Mensalidade {
    if (!this.isPendente()) {
      throw new BadRequestException(`Mensalidade não pode ser quitada. Status atual: ${this.props.status}`)
    }
    return new Mensalidade({
      ...this.props,
      status: StatusMensalidade.PAGO,
      metodoPagamento: metodo,
      dataPagamento: new Date(),
    })
  }

  isentar(motivo?: string): Mensalidade {
    if (!this.isPendente()) {
      throw new BadRequestException(`Apenas mensalidades PENDENTES podem ser isentadas. Status atual: ${this.props.status}`)
    }
    return new Mensalidade({
      ...this.props,
      status: StatusMensalidade.ISENTO,
      motivoIsencao: motivo,
    })
  }

  reativar(): Mensalidade {
    if (!this.isIsento()) {
      throw new BadRequestException(`Apenas mensalidades ISENTAS podem ser reativadas. Status atual: ${this.props.status}`)
    }
    return new Mensalidade({
      ...this.props,
      status: StatusMensalidade.PENDENTE,
      motivoIsencao: undefined,
    })
  }

  comCobranca(gatewayId: string, linkPagamento: string, cobrancaStatus: string, pixCopiaECola?: string, valorCobrado?: number): Mensalidade {
    if (!this.isPendente()) {
      throw new BadRequestException(`Somente mensalidades PENDENTES podem ter cobrança emitida. Status atual: ${this.props.status}`)
    }
    return new Mensalidade({
      ...this.props,
      cobrancaGatewayId: gatewayId,
      cobrancaLink: linkPagamento,
      cobrancaStatus,
      cobrancaPixCopiaECola: pixCopiaECola,
      cobrancaValorCobrado: valorCobrado,
    })
  }

  estornar(): Mensalidade {
    if (!this.isPago()) {
      throw new BadRequestException(`Apenas mensalidades PAGAS podem ser estornadas. Status atual: ${this.props.status}`)
    }
    return new Mensalidade({
      ...this.props,
      status: StatusMensalidade.PENDENTE,
      metodoPagamento: undefined,
      dataPagamento: undefined,
      cobrancaGatewayId: undefined,
      cobrancaLink: undefined,
      cobrancaStatus: undefined,
      cobrancaPixCopiaECola: undefined,
      cobrancaValorCobrado: undefined,
    })
  }

  semCobranca(): Mensalidade {
    return new Mensalidade({
      ...this.props,
      cobrancaGatewayId: undefined,
      cobrancaLink: undefined,
      cobrancaStatus: undefined,
      cobrancaPixCopiaECola: undefined,
      cobrancaValorCobrado: undefined,
    })
  }

  get competenciaLabel(): string {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[this.props.competenciaMes - 1]}/${this.props.competenciaAno}`
  }
}
