import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IExcluirSolicitacaoContatoUseCase,
  ISolicitacaoContatoRepository,
} from '@apa/core'
import { SOLICITACAO_CONTATO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class ExcluirSolicitacaoContatoUseCase implements IExcluirSolicitacaoContatoUseCase {
  constructor(
    @Inject(SOLICITACAO_CONTATO_REPOSITORY) private readonly repo: ISolicitacaoContatoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const s = await this.repo.findById(id)
    if (!s) throw new NotFoundException('Solicitação não encontrada.')
    await this.repo.delete(id)
  }
}
