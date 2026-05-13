import { TipoLote } from '@apa/shared'
import type { EstoqueMateriaPrima } from '../../entities/EstoqueMateriaPrima'
import { LoteProducao } from '../../entities/LoteProducao'
import { ParticipacaoLote } from '../../entities/ParticipacaoLote'

export interface CriarLoteInput {
  tipo: TipoLote
  periodo: string
  dataInicio: Date
  dataFim?: Date
}

export interface RegistrarParticipacaoInput {
  loteProducaoId: string
  associadoId: string
  volume?: number
  valorInvestido?: number
}

export interface AtualizarParticipacaoInput {
  volume?: number
  valorInvestido?: number
  percentual?: number
  percentualManual?: boolean
}

export interface ICriarLoteUseCase {
  execute(input: CriarLoteInput): Promise<LoteProducao>
}

export interface IListarLotesUseCase {
  execute(): Promise<LoteProducao[]>
}

export interface IBuscarLoteUseCase {
  execute(id: string): Promise<LoteProducao>
}

export interface IEncerrarLoteUseCase {
  execute(id: string): Promise<LoteProducao>
}

export interface IRegistrarParticipacaoUseCase {
  execute(input: RegistrarParticipacaoInput): Promise<ParticipacaoLote>
}

export interface IListarParticipacoesPorLoteUseCase {
  execute(loteId: string): Promise<ParticipacaoLote[]>
}

export interface IAtualizarParticipacaoUseCase {
  execute(loteId: string, associadoId: string, input: AtualizarParticipacaoInput): Promise<ParticipacaoLote>
}

export interface ICalcularRateioUseCase {
  execute(loteId: string): Promise<ParticipacaoLote[]>
}

export interface IConsultarEstoqueUseCase {
  execute(): Promise<EstoqueMateriaPrima[]>
}
