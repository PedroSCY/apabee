import { MetodoPagamentoMensalidade, StatusMensalidade } from '@apa/shared'
import { Mensalidade } from '../../entities/Mensalidade'

export interface GerarMensalidadesInput {
  competenciaAno: number
  competenciaMes: number
  valorPadrao?: number
}

export interface QuitarMensalidadeInput {
  mensalidadeId: string
  metodoPagamento: MetodoPagamentoMensalidade
}

export interface MarcarIsentoMensalidadeInput {
  mensalidadeId: string
  motivo?: string
}

export interface ListarMensalidadesInput {
  competenciaAno?: number
  competenciaMes?: number
  status?: StatusMensalidade
}

export interface IGerarMensalidadesUseCase {
  execute(input: GerarMensalidadesInput): Promise<Mensalidade[]>
}

export interface IQuitarMensalidadeUseCase {
  execute(input: QuitarMensalidadeInput): Promise<Mensalidade>
}

export interface IMarcarIsentoMensalidadeUseCase {
  execute(input: MarcarIsentoMensalidadeInput): Promise<Mensalidade>
}

export interface IReativarMensalidadeUseCase {
  execute(mensalidadeId: string): Promise<Mensalidade>
}

export interface IListarMensalidadesUseCase {
  execute(input: ListarMensalidadesInput): Promise<Mensalidade[]>
}

export interface IListarMensalidadesPorAssociadoUseCase {
  execute(associadoId: string): Promise<Mensalidade[]>
}

export interface EmitirCobrancaResult {
  mensalidade: Mensalidade
  linkPagamento: string
  pixCopiaECola?: string
  pixQrCodeBase64?: string
  valorCobrado?: number
}

export interface IEmitirCobrancaMensalidadeUseCase {
  execute(mensalidadeId: string): Promise<EmitirCobrancaResult>
}

export interface ICancelarCobrancaUseCase {
  execute(mensalidadeId: string): Promise<Mensalidade>
}

export interface IEstornarMensalidadeUseCase {
  execute(mensalidadeId: string): Promise<Mensalidade>
}

export interface IExcluirMensalidadeUseCase {
  execute(mensalidadeId: string): Promise<void>
}

export interface ListarMovimentosInput {
  associadoId?: string
  campanhaId?: string
  limit?: number
}

export interface IListarMovimentosUseCase {
  execute(input?: ListarMovimentosInput): Promise<import('../../entities/MovimentoFinanceiro').MovimentoFinanceiro[]>
}

export interface DashboardGraficoMes {
  mes: number
  receita: number
  despesa: number
}

export interface DashboardFinanceiro {
  receitaYTD: number
  despesasYTD: number
  saldoLiquido: number
  inadimplentes: number
  graficoMensal: DashboardGraficoMes[]
}

export interface IObterDashboardFinanceiroUseCase {
  execute(ano: number): Promise<DashboardFinanceiro>
}

export interface RegistrarMovimentoInput {
  associadoId: string
  campanhaId?: string
  tipo: 'ANTECIPACAO' | 'CUSTO'
  valor: number
  descricao?: string
  data?: Date
}

export interface IRegistrarMovimentoUseCase {
  execute(input: RegistrarMovimentoInput): Promise<import('../../entities/MovimentoFinanceiro').MovimentoFinanceiro>
}
