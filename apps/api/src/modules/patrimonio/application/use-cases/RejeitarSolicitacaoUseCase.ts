import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IRejeitarSolicitacaoUseCase,
  ISolicitacaoPatrimonioRepository,
  SolicitacaoPatrimonio,
} from '@apa/core'
import { TipoNotificacao } from '@apa/shared'
import { SOLICITACAO_PATRIMONIO_REPOSITORY } from '../../patrimonio.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

@Injectable()
export class RejeitarSolicitacaoUseCase implements IRejeitarSolicitacaoUseCase {
  constructor(
    @Inject(SOLICITACAO_PATRIMONIO_REPOSITORY)
    private readonly solicitacaoRepository: ISolicitacaoPatrimonioRepository,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  async execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio> {
    const solicitacao = await this.solicitacaoRepository.findById(solicitacaoId)
    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.')
    if (!solicitacao.isPendente())
      throw new BadRequestException('Apenas solicitações pendentes podem ser rejeitadas.')

    const resultado = await this.solicitacaoRepository.update(solicitacao.rejeitar())

    void this.notificacaoService.enviarParaAssociado(
      solicitacao.associadoId,
      TipoNotificacao.SOLICITACAO_REJEITADA,
      'Solicitação de patrimônio rejeitada',
      'Sua solicitação foi analisada e não pôde ser atendida desta vez.',
      { solicitacaoId: solicitacao.id },
    )

    return resultado
  }
}
