import { Inject, Injectable } from '@nestjs/common'
import {
  IListarSolicitacoesUseCase,
  ISolicitacaoPatrimonioRepository,
  SolicitacaoPatrimonio,
} from '@apa/core'
import { StatusSolicitacaoPatrimonio } from '@apa/shared'
import { SOLICITACAO_PATRIMONIO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ListarSolicitacoesUseCase implements IListarSolicitacoesUseCase {
  constructor(
    @Inject(SOLICITACAO_PATRIMONIO_REPOSITORY)
    private readonly solicitacaoRepository: ISolicitacaoPatrimonioRepository,
  ) {}

  async execute(
    filter?: { status?: StatusSolicitacaoPatrimonio; associadoId?: string },
  ): Promise<SolicitacaoPatrimonio[]> {
    if (filter?.associadoId) {
      return this.solicitacaoRepository.findByAssociado(filter.associadoId)
    }
    return this.solicitacaoRepository.findAll(filter?.status)
  }
}
