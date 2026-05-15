import { StatusSafra } from '@apa/shared'
import { PrecoSafra } from '../../entities/PrecoSafra'
import { Safra } from '../../entities/Safra'

export interface CriarSafraInput {
  nome: string
  floradaId: string
  dataInicio: Date
  dataFim?: Date
}

export interface AtualizarSafraInput {
  nome?: string
  dataFim?: Date
}

export interface DefinirPrecoSafraInput {
  tipoMateriaPrimaId: string
  safraId: string
  preco: number
}

export interface ICriarSafraUseCase {
  execute(input: CriarSafraInput): Promise<Safra>
}

export interface IListarSafrasUseCase {
  execute(status?: StatusSafra): Promise<Safra[]>
}

export interface IBuscarSafraUseCase {
  execute(id: string): Promise<Safra>
}

export interface IAtualizarSafraUseCase {
  execute(id: string, input: AtualizarSafraInput): Promise<Safra>
}

export interface IIniciarSafraUseCase {
  execute(id: string): Promise<Safra>
}

export interface IEncerrarSafraUseCase {
  execute(id: string): Promise<Safra>
}

export interface IDefinirPrecoSafraUseCase {
  execute(input: DefinirPrecoSafraInput): Promise<PrecoSafra>
}

export interface IListarPrecosSafraUseCase {
  execute(safraId: string): Promise<PrecoSafra[]>
}

export interface IBuscarPrecoVigenteUseCase {
  /** Retorna o preço do TipoMateriaPrima para a safra informada. Fallback para TipoMateriaPrima.precoAtual se não houver PrecoSafra. */
  execute(tipoMateriaPrimaId: string, safraId: string): Promise<number | null>
}
