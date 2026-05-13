import { UnidadeMedida } from '@apa/shared'
import { TipoMateriaPrima } from '../../entities/TipoMateriaPrima'

/** Dados para criação de um tipo de matéria-prima. */
export interface CriarTipoMateriaPrimaInput {
  nome: string
  unidade: UnidadeMedida
  descricao?: string
}

/** Cria um novo tipo de matéria-prima. */
export interface ICriarTipoMateriaPrimaUseCase {
  execute(input: CriarTipoMateriaPrimaInput): Promise<TipoMateriaPrima>
}

/** Lista todos os tipos de matéria-prima cadastrados. */
export interface IListarTiposMateriaPrimaUseCase {
  execute(): Promise<TipoMateriaPrima[]>
}

/** Busca um tipo de matéria-prima pelo ID. */
export interface IBuscarTipoMateriaPrimaUseCase {
  execute(id: string): Promise<TipoMateriaPrima>
}
