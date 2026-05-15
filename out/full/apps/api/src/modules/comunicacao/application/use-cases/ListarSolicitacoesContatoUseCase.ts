import { Inject, Injectable } from '@nestjs/common'
import { StatusSolicitacaoContato } from '@apa/shared'
import {
  IListarSolicitacoesContatoUseCase,
  ISolicitacaoContatoRepository,
  SolicitacaoContato,
} from '@apa/core'
import { SOLICITACAO_CONTATO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class ListarSolicitacoesContatoUseCase implements IListarSolicitacoesContatoUseCase {
  constructor(
    @Inject(SOLICITACAO_CONTATO_REPOSITORY) private readonly repo: ISolicitacaoContatoRepository,
  ) {}

  async execute(status?: StatusSolicitacaoContato): Promise<SolicitacaoContato[]> {
    return this.repo.findAll(status)
  }
}
