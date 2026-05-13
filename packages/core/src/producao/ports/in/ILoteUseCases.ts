import { TipoLote } from '@apa/shared'
import type { EstoqueMateriaPrima } from '../../entities/EstoqueMateriaPrima'
import { LoteProducao } from '../../entities/LoteProducao'
import { ParticipacaoLote } from '../../entities/ParticipacaoLote'

/** Dados para criação de um novo lote. */
export interface CriarLoteInput {
  tipo: TipoLote
  periodo: string
  dataInicio: Date
  dataFim?: Date
}

/** Dados para registrar participação de um associado no lote. */
export interface RegistrarParticipacaoInput {
  loteProducaoId: string
  associadoId: string
  volume?: number
  valorInvestido?: number
}

/** Dados para atualizar a participação de um associado no lote. */
export interface AtualizarParticipacaoInput {
  volume?: number
  valorInvestido?: number
  percentual?: number
  percentualManual?: boolean
}

/** Cria um novo lote de produção ou aquisição. */
export interface ICriarLoteUseCase {
  execute(input: CriarLoteInput): Promise<LoteProducao>
}

/** Lista todos os lotes cadastrados. */
export interface IListarLotesUseCase {
  execute(): Promise<LoteProducao[]>
}

/** Busca um lote pelo ID. */
export interface IBuscarLoteUseCase {
  execute(id: string): Promise<LoteProducao>
}

/** Encerra um lote alterando seu status para FECHADO. */
export interface IEncerrarLoteUseCase {
  execute(id: string): Promise<LoteProducao>
}

/** Registra a participação de um associado em um lote. */
export interface IRegistrarParticipacaoUseCase {
  execute(input: RegistrarParticipacaoInput): Promise<ParticipacaoLote>
}

/** Lista todas as participações de um lote. */
export interface IListarParticipacoesPorLoteUseCase {
  execute(loteId: string): Promise<ParticipacaoLote[]>
}

/** Atualiza os dados de participação de um associado no lote. */
export interface IAtualizarParticipacaoUseCase {
  execute(loteId: string, associadoId: string, input: AtualizarParticipacaoInput): Promise<ParticipacaoLote>
}

/** Calcula o rateio financeiro de um lote entre os participantes. */
export interface ICalcularRateioUseCase {
  execute(loteId: string): Promise<ParticipacaoLote[]>
}

/** Consulta o estoque atual de todas as matérias-primas. */
export interface IConsultarEstoqueUseCase {
  execute(): Promise<EstoqueMateriaPrima[]>
}
