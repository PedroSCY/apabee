import { Inject, Injectable } from '@nestjs/common'
import { IMarcarTodasLidasUseCase, INotificacaoRepository } from '@apa/core'
import { NOTIFICACAO_REPOSITORY } from '../../notificacao.tokens'

@Injectable()
export class MarcarTodasLidasUseCase implements IMarcarTodasLidasUseCase {
  constructor(
    @Inject(NOTIFICACAO_REPOSITORY)
    private readonly repo: INotificacaoRepository,
  ) {}

  execute(userId: string): Promise<void> {
    return this.repo.marcarTodasLidas(userId)
  }
}
