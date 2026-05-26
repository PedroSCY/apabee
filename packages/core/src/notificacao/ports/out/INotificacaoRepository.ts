import { TipoNotificacao } from '@apa/shared'
import { Notificacao } from '../../entities/Notificacao'

export interface CriarNotificacaoInput {
  userId: string
  tipo: TipoNotificacao
  titulo: string
  corpo?: string
  dadosExtras?: Record<string, unknown>
}

export interface INotificacaoRepository {
  criar(input: CriarNotificacaoInput): Promise<Notificacao>
  criarEmLote(inputs: CriarNotificacaoInput[]): Promise<void>
  listarPorUsuario(userId: string, limit?: number): Promise<Notificacao[]>
  contarNaoLidas(userId: string): Promise<number>
  marcarLida(id: string, userId: string): Promise<Notificacao | null>
  marcarTodasLidas(userId: string): Promise<void>
}
