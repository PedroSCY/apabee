import { TipoSolicitacaoContato, StatusSolicitacaoContato } from '@apa/shared'
import { SolicitacaoContato } from '../../entities/SolicitacaoContato'

export interface CriarSolicitacaoContatoInput {
  tipo: TipoSolicitacaoContato
  nome: string
  email: string
  telefone?: string
  mensagem: string
  localizacao?: string
  municipio?: string
}

export interface ICriarSolicitacaoContatoUseCase {
  execute(input: CriarSolicitacaoContatoInput): Promise<SolicitacaoContato>
}

export interface IListarSolicitacoesContatoUseCase {
  execute(status?: StatusSolicitacaoContato): Promise<SolicitacaoContato[]>
}

export interface IAtualizarStatusSolicitacaoContatoUseCase {
  execute(id: string, status: StatusSolicitacaoContato): Promise<SolicitacaoContato>
}

export interface IExcluirSolicitacaoContatoUseCase {
  execute(id: string): Promise<void>
}
