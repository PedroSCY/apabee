import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { StatusSolicitacaoContato } from '@apa/shared'
import {
  IAtualizarStatusSolicitacaoContatoUseCase,
  ISolicitacaoContatoRepository,
  SolicitacaoContato,
} from '@apa/core'
import { SOLICITACAO_CONTATO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class AtualizarStatusSolicitacaoContatoUseCase implements IAtualizarStatusSolicitacaoContatoUseCase {
  constructor(
    @Inject(SOLICITACAO_CONTATO_REPOSITORY) private readonly repo: ISolicitacaoContatoRepository,
  ) {}

  async execute(id: string, status: StatusSolicitacaoContato): Promise<SolicitacaoContato> {
    const s = await this.repo.findById(id)
    if (!s) throw new NotFoundException('Solicitação não encontrada.')

    let updated: SolicitacaoContato
    if (status === StatusSolicitacaoContato.VISUALIZADA) updated = s.visualizar()
    else updated = s.resolver()

    return this.repo.update(updated)
  }
}
