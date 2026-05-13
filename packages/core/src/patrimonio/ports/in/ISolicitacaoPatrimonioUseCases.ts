import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import { SolicitacaoPatrimonio } from '../../entities/SolicitacaoPatrimonio'

export interface CriarSolicitacaoInput {
  patrimonioId: string
  tipoPatrimonio: TipoPatrimonio
  associadoId: string
  justificativa?: string
}

export interface ICriarSolicitacaoUseCase {
  execute(input: CriarSolicitacaoInput): Promise<SolicitacaoPatrimonio>
}

export interface IAprovarSolicitacaoUseCase {
  execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio>
}

export interface IRejeitarSolicitacaoUseCase {
  execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio>
}

export interface IListarSolicitacoesUseCase {
  execute(filter?: { status?: StatusSolicitacaoPatrimonio; associadoId?: string }): Promise<SolicitacaoPatrimonio[]>
}
