import { Inject, Injectable } from '@nestjs/common'
import { Notificacao, IMarcarLidaUseCase, INotificacaoRepository } from '@apa/core'
import { NOTIFICACAO_REPOSITORY } from '../../notificacao.tokens'

@Injectable()
export class MarcarLidaUseCase implements IMarcarLidaUseCase {
  constructor(
    @Inject(NOTIFICACAO_REPOSITORY)
    private readonly repo: INotificacaoRepository,
  ) {}

  execute(id: string, userId: string): Promise<Notificacao | null> {
    return this.repo.marcarLida(id, userId)
  }
}
