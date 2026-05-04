import { UnidadeMedida } from '@apa/shared'
import { TipoMateriaPrima } from '../../entities/TipoMateriaPrima'

export interface CriarTipoMateriaPrimaInput {
  nome: string
  unidade: UnidadeMedida
  descricao?: string
}

export interface ICriarTipoMateriaPrimaUseCase {
  execute(input: CriarTipoMateriaPrimaInput): Promise<TipoMateriaPrima>
}

export interface IListarTiposMateriaPrimaUseCase {
  execute(): Promise<TipoMateriaPrima[]>
}

export interface IBuscarTipoMateriaPrimaUseCase {
  execute(id: string): Promise<TipoMateriaPrima>
}
