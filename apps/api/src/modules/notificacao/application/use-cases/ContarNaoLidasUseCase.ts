import { Inject, Injectable } from '@nestjs/common'
import { IContarNaoLidasUseCase, INotificacaoRepository } from '@apa/core'
import { NOTIFICACAO_REPOSITORY } from '../../notificacao.tokens'

@Injectable()
export class ContarNaoLidasUseCase implements IContarNaoLidasUseCase {
  constructor(
    @Inject(NOTIFICACAO_REPOSITORY)
    private readonly repo: INotificacaoRepository,
  ) {}

  execute(userId: string): Promise<number> {
    return this.repo.contarNaoLidas(userId)
  }
}
