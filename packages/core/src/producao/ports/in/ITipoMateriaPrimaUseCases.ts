import { UnidadeMedida } from '@apa/shared'
import { TipoMateriaPrima } from '../../entities/TipoMateriaPrima'
import { EstoqueMateriaPrima } from '../../entities/EstoqueMateriaPrima'

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

/** Retorna todos os estoques de matéria-prima. */
export interface IConsultarEstoqueUseCase {
  execute(): Promise<EstoqueMateriaPrima[]>
}

/** Deleta um tipo de matéria-prima (somente se não houver dependências). */
export interface IDeletarTipoMateriaPrimaUseCase {
  execute(id: string): Promise<void>
}

/** Remove um item do pool de estoque quando o saldo é zero. */
export interface IDeletarItemPoolUseCase {
  execute(tipoMateriaPrimaId: string): Promise<void>
}
