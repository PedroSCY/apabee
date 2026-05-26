import { Inject, Injectable } from '@nestjs/common'
import { Notificacao, IListarNotificacoesUseCase, INotificacaoRepository } from '@apa/core'
import { NOTIFICACAO_REPOSITORY } from '../../notificacao.tokens'

@Injectable()
export class ListarNotificacoesUseCase implements IListarNotificacoesUseCase {
  constructor(
    @Inject(NOTIFICACAO_REPOSITORY)
    private readonly repo: INotificacaoRepository,
  ) {}

  execute(userId: string, limit?: number): Promise<Notificacao[]> {
    return this.repo.listarPorUsuario(userId, limit)
  }
}
