import { Notificacao } from '../../entities/Notificacao'

export interface IListarNotificacoesUseCase {
  execute(userId: string, limit?: number): Promise<Notificacao[]>
}

export interface IContarNaoLidasUseCase {
  execute(userId: string): Promise<number>
}

export interface IMarcarLidaUseCase {
  execute(id: string, userId: string): Promise<Notificacao | null>
}

export interface IMarcarTodasLidasUseCase {
  execute(userId: string): Promise<void>
}
