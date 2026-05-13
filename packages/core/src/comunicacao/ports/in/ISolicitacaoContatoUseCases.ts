import { TipoSolicitacaoContato, StatusSolicitacaoContato } from '@apa/shared'
import { SolicitacaoContato } from '../../entities/SolicitacaoContato'

/** Dados para criação de uma solicitação de contato. */
export interface CriarSolicitacaoContatoInput {
  tipo: TipoSolicitacaoContato
  nome: string
  email: string
  telefone?: string
  mensagem: string
  localizacao?: string
  municipio?: string
}

/** Caso de uso: criar uma solicitação de contato. */
export interface ICriarSolicitacaoContatoUseCase {
  execute(input: CriarSolicitacaoContatoInput): Promise<SolicitacaoContato>
}

/** Caso de uso: listar solicitações de contato. */
export interface IListarSolicitacoesContatoUseCase {
  execute(status?: StatusSolicitacaoContato): Promise<SolicitacaoContato[]>
}

/** Caso de uso: atualizar status de uma solicitação. */
export interface IAtualizarStatusSolicitacaoContatoUseCase {
  execute(id: string, status: StatusSolicitacaoContato): Promise<SolicitacaoContato>
}

/** Caso de uso: excluir uma solicitação de contato. */
export interface IExcluirSolicitacaoContatoUseCase {
  execute(id: string): Promise<void>
}
