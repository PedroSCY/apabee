import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import { SolicitacaoPatrimonio } from '../../entities/SolicitacaoPatrimonio'

/** Dados para criar solicitação de equipamento específico. */
export interface CriarSolicitacaoEquipamentoInput {
  tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO
  patrimonioId: string
  associadoId: string
  justificativa?: string
}

/** Dados para criar solicitação de insumo por tipo e quantidade. */
export interface CriarSolicitacaoInsumoInput {
  tipoPatrimonio: TipoPatrimonio.INSUMO
  tipoInsumoId: string
  quantidade: number
  associadoId: string
  justificativa?: string
}

export type CriarSolicitacaoInput =
  | CriarSolicitacaoEquipamentoInput
  | CriarSolicitacaoInsumoInput

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
