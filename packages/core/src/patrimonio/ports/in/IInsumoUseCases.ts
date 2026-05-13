import { CategoriaInsumo } from '@apa/shared'
import { Insumo } from '../../entities/Insumo'

export interface CriarInsumoInput {
  nome: string
  categoria: CategoriaInsumo
  descricao?: string
}

export interface AtualizarInsumoInput {
  nome?: string
  descricao?: string
}

export interface ICriarInsumoUseCase {
  execute(input: CriarInsumoInput): Promise<Insumo>
}

export interface IListarInsumosUseCase {
  execute(): Promise<Insumo[]>
}

export interface IBuscarInsumoUseCase {
  execute(id: string): Promise<Insumo>
}

export interface IAtualizarInsumoUseCase {
  execute(id: string, input: AtualizarInsumoInput): Promise<Insumo>
}

export interface IColocarInsumoEmManutencaoUseCase {
  execute(id: string): Promise<Insumo>
}

export interface IExcluirInsumoUseCase {
  execute(id: string): Promise<void>
}

export interface ILiberarInsumoManutencaoUseCase {
  execute(id: string): Promise<Insumo>
}
