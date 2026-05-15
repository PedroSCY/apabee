import { CategoriaInsumo } from '@apa/shared'
import { TipoInsumo } from '../../entities/TipoInsumo'

export interface CriarTipoInsumoInput {
  nome: string
  descricao?: string
  categoria: CategoriaInsumo
  sigla: string
}

export interface AtualizarTipoInsumoInput {
  nome?: string
  descricao?: string
  sigla?: string
}

export interface ICriarTipoInsumoUseCase {
  execute(input: CriarTipoInsumoInput): Promise<TipoInsumo>
}

export interface IListarTiposInsumoUseCase {
  execute(): Promise<TipoInsumo[]>
}

export interface IBuscarTipoInsumoUseCase {
  execute(id: string): Promise<TipoInsumo>
}

export interface IAtualizarTipoInsumoUseCase {
  execute(id: string, input: AtualizarTipoInsumoInput): Promise<TipoInsumo>
}

export interface IExcluirTipoInsumoUseCase {
  execute(id: string): Promise<void>
}
