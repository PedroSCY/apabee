import { DestinatarioCampanha, StatusCampanha, TipoLote } from '@apa/shared'
import { Campanha } from '../../entities/Campanha'
import { EstoqueCampanha } from '../../entities/EstoqueCampanha'

export interface CriarCampanhaInput {
  nome: string
  tipo: TipoLote
  safraId?: string
  dataInicio: Date
  dataFim?: Date
  // apenas AQUISICAO
  destinatario?: DestinatarioCampanha
  valorMeta?: number
  prazoContribuicao?: Date
  valorMinimo?: number
  valorMaximo?: number
}

export interface ICriarCampanhaUseCase {
  execute(input: CriarCampanhaInput): Promise<Campanha>
}

export interface IListarCampanhasUseCase {
  execute(status?: StatusCampanha): Promise<Campanha[]>
}

export interface IBuscarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface IIniciarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface IConcluirCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface ILiquidarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface ICancelarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

/** Remove permanentemente uma campanha. Apenas PLANEJADA ou CANCELADA podem ser deletadas. */
export interface IDeletarCampanhaUseCase {
  execute(id: string): Promise<void>
}

/** Informa a receita total antes da liquidação (campanha CONCLUIDA). */
export interface IAtualizarReceitaCampanhaUseCase {
  execute(id: string, receitaTotal: number): Promise<Campanha>
}

export interface IListarEstoqueCampanhaUseCase {
  execute(campanhaId: string): Promise<EstoqueCampanha[]>
}

export interface PreviewRateioParticipante {
  associadoId: string
  contribuicaoTotal: number
  percentual: number
  valorBruto: number
  custosRateados: number
  antecipacoes: number
  valorFinal: number
}

export interface PreviewRateioResult {
  faturamentoTotal: number
  custoTotal: number
  lucroLiquido: number
  participantes: PreviewRateioParticipante[]
}

/** Calcula o preview do rateio sem persistir — campanha deve estar CONCLUIDA e ter receitaTotal > 0. */
export interface IPreviewRateioCampanhaUseCase {
  execute(id: string): Promise<PreviewRateioResult>
}
