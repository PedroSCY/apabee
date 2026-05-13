import { TipoPatrimonio } from '@apa/shared'
import { AtribuicaoPatrimonio } from '../../entities/AtribuicaoPatrimonio'

/** Dados necessários para atribuir um patrimônio a um associado. */
export interface AtribuirPatrimonioInput {
  patrimonioId: string
  tipoPatrimonio: TipoPatrimonio
  associadoId: string
  observacao?: string
  dataInicio?: Date
}

/** Caso de uso para atribuir patrimônio a um associado. */
export interface IAtribuirPatrimonioUseCase {
  execute(input: AtribuirPatrimonioInput): Promise<AtribuicaoPatrimonio>
}

/** Caso de uso para devolver (encerrar) uma atribuição de patrimônio. */
export interface IDevolverPatrimonioUseCase {
  execute(atribuicaoId: string): Promise<AtribuicaoPatrimonio>
}

/** Caso de uso para listar atribuições de um associado. */
export interface IListarAtribuicoesPorAssociadoUseCase {
  execute(associadoId: string): Promise<AtribuicaoPatrimonio[]>
}

/** Caso de uso para listar todas as atribuições. */
export interface IListarTodasAtribuicoesUseCase {
  execute(): Promise<AtribuicaoPatrimonio[]>
}
