import { TipoPatrimonio } from '@apa/shared'
import { AtribuicaoPatrimonio } from '../../entities/AtribuicaoPatrimonio'

export interface AtribuirPatrimonioInput {
  patrimonioId: string
  tipoPatrimonio: TipoPatrimonio
  associadoId: string
  observacao?: string
  dataInicio?: Date
}

export interface IAtribuirPatrimonioUseCase {
  execute(input: AtribuirPatrimonioInput): Promise<AtribuicaoPatrimonio>
}

export interface IDevolverPatrimonioUseCase {
  execute(atribuicaoId: string): Promise<AtribuicaoPatrimonio>
}

export interface IListarAtribuicoesPorAssociadoUseCase {
  execute(associadoId: string): Promise<AtribuicaoPatrimonio[]>
}
