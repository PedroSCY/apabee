import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IRejeitarSolicitacaoUseCase,
  ISolicitacaoPatrimonioRepository,
  SolicitacaoPatrimonio,
} from '@apa/core'
import { SOLICITACAO_PATRIMONIO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class RejeitarSolicitacaoUseCase implements IRejeitarSolicitacaoUseCase {
  constructor(
    @Inject(SOLICITACAO_PATRIMONIO_REPOSITORY)
    private readonly solicitacaoRepository: ISolicitacaoPatrimonioRepository,
  ) {}

  async execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio> {
    const solicitacao = await this.solicitacaoRepository.findById(solicitacaoId)
    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.')
    if (!solicitacao.isPendente())
      throw new BadRequestException('Apenas solicitações pendentes podem ser rejeitadas.')

    return this.solicitacaoRepository.update(solicitacao.rejeitar())
  }
}
