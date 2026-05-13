import { Insumo } from '../../entities/Insumo'

/** Dados para adicionar unidades individuais de um tipo de insumo. */
export interface AdicionarUnidadesInsumoInput {
  tipoInsumoId: string
  quantidade: number
  descricao?: string
}

/** Caso de uso para adicionar N unidades de um tipo de insumo. */
export interface IAdicionarUnidadesInsumoUseCase {
  execute(input: AdicionarUnidadesInsumoInput): Promise<Insumo[]>
}

/** Caso de uso para listagem de unidades de insumo. */
export interface IListarInsumosUseCase {
  execute(tipoInsumoId?: string): Promise<Insumo[]>
}

/** Caso de uso para busca de unidade de insumo por ID. */
export interface IBuscarInsumoUseCase {
  execute(id: string): Promise<Insumo>
}

/** Caso de uso para colocar unidade de insumo em manutenção. */
export interface IColocarInsumoEmManutencaoUseCase {
  execute(id: string): Promise<Insumo>
}

/** Caso de uso para liberar unidade de insumo da manutenção. */
export interface ILiberarInsumoManutencaoUseCase {
  execute(id: string): Promise<Insumo>
}

/** Caso de uso para exclusão de unidade de insumo. */
export interface IExcluirInsumoUseCase {
  execute(id: string): Promise<void>
}
