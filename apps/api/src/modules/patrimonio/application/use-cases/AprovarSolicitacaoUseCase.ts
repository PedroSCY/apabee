import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IAprovarSolicitacaoUseCase,
  IAtribuirPatrimonioUseCase,
  ISolicitacaoPatrimonioRepository,
  SolicitacaoPatrimonio,
} from '@apa/core'
import {
  ATRIBUIR_PATRIMONIO_USE_CASE,
  SOLICITACAO_PATRIMONIO_REPOSITORY,
} from '../../patrimonio.tokens'

@Injectable()
export class AprovarSolicitacaoUseCase implements IAprovarSolicitacaoUseCase {
  constructor(
    @Inject(SOLICITACAO_PATRIMONIO_REPOSITORY)
    private readonly solicitacaoRepository: ISolicitacaoPatrimonioRepository,
    @Inject(ATRIBUIR_PATRIMONIO_USE_CASE)
    private readonly atribuirPatrimonio: IAtribuirPatrimonioUseCase,
  ) {}

  async execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio> {
    const solicitacao = await this.solicitacaoRepository.findById(solicitacaoId)
    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.')
    if (!solicitacao.isPendente())
      throw new BadRequestException('Apenas solicitações pendentes podem ser aprovadas.')

    await this.atribuirPatrimonio.execute({
      patrimonioId: solicitacao.patrimonioId,
      tipoPatrimonio: solicitacao.tipoPatrimonio,
      associadoId: solicitacao.associadoId,
      observacao: solicitacao.justificativa,
    })

    return this.solicitacaoRepository.update(solicitacao.aprovar())
  }
}
