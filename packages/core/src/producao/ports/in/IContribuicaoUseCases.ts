import { TipoContribuicao } from '@apa/shared'
import { Contribuicao } from '../../entities/Contribuicao'

export interface RegistrarContribuicaoInput {
  campanhaId: string
  associadoId: string
  tipo: TipoContribuicao
  valorMonetario: number
  // COLHEITA
  colheitaId?: string
  volume?: number
  tipoMateriaPrimaId?: string
  descricao?: string
}

export interface AtualizarContribuicaoInput {
  valorMonetario?: number
  descricao?: string
}

export interface IRegistrarContribuicaoUseCase {
  execute(input: RegistrarContribuicaoInput): Promise<Contribuicao>
}

export interface IListarContribuicoesPorCampanhaUseCase {
  execute(campanhaId: string): Promise<Contribuicao[]>
}

export interface IListarContribuicoesPorAssociadoUseCase {
  execute(associadoId: string): Promise<Contribuicao[]>
}

export interface IAtualizarContribuicaoUseCase {
  execute(id: string, input: AtualizarContribuicaoInput): Promise<Contribuicao>
}

export interface IRemoverContribuicaoUseCase {
  execute(id: string): Promise<void>
}

export interface ICalcularContribuicaoTotalUseCase {
  /** Retorna o total proporcional de contribuição de cada associado na campanha (volume para PRODUCAO, valor para AQUISICAO). */
  execute(campanhaId: string): Promise<{ associadoId: string; total: number }[]>
}
