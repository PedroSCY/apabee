import { CategoriaInsumo } from '@apa/shared'
import { Insumo } from '../../entities/Insumo'

/** Dados necessários para criar um novo insumo. */
export interface CriarInsumoInput {
  nome: string
  categoria: CategoriaInsumo
  descricao?: string
}

/** Dados para atualização parcial de um insumo. */
export interface AtualizarInsumoInput {
  nome?: string
  descricao?: string
}

/** Caso de uso para criação de insumo. */
export interface ICriarInsumoUseCase {
  execute(input: CriarInsumoInput): Promise<Insumo>
}

/** Caso de uso para listagem de insumos. */
export interface IListarInsumosUseCase {
  execute(): Promise<Insumo[]>
}

/** Caso de uso para busca de insumo por ID. */
export interface IBuscarInsumoUseCase {
  execute(id: string): Promise<Insumo>
}

/** Caso de uso para atualização de insumo. */
export interface IAtualizarInsumoUseCase {
  execute(id: string, input: AtualizarInsumoInput): Promise<Insumo>
}

/** Caso de uso para colocar insumo em manutenção. */
export interface IColocarInsumoEmManutencaoUseCase {
  execute(id: string): Promise<Insumo>
}

/** Caso de uso para exclusão de insumo. */
export interface IExcluirInsumoUseCase {
  execute(id: string): Promise<void>
}

/** Caso de uso para liberar insumo da manutenção. */
export interface ILiberarInsumoManutencaoUseCase {
  execute(id: string): Promise<Insumo>
}
