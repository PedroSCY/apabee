import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import { SolicitacaoPatrimonio } from '../../entities/SolicitacaoPatrimonio'

/** Dados necessários para criar uma solicitação de patrimônio. */
export interface CriarSolicitacaoInput {
  patrimonioId: string
  tipoPatrimonio: TipoPatrimonio
  associadoId: string
  justificativa?: string
}

/** Caso de uso para criar solicitação de patrimônio. */
export interface ICriarSolicitacaoUseCase {
  execute(input: CriarSolicitacaoInput): Promise<SolicitacaoPatrimonio>
}

/** Caso de uso para aprovar uma solicitação pendente. */
export interface IAprovarSolicitacaoUseCase {
  execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio>
}

/** Caso de uso para rejeitar uma solicitação pendente. */
export interface IRejeitarSolicitacaoUseCase {
  execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio>
}

/** Caso de uso para listar solicitações com filtros opcionais. */
export interface IListarSolicitacoesUseCase {
  execute(filter?: { status?: StatusSolicitacaoPatrimonio; associadoId?: string }): Promise<SolicitacaoPatrimonio[]>
}
