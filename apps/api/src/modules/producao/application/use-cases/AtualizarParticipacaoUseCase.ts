import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtualizarParticipacaoInput,
  IAtualizarParticipacaoUseCase,
  IParticipacaoLoteRepository,
  ParticipacaoLote,
} from '@apa/core'
import { PARTICIPACAO_LOTE_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class AtualizarParticipacaoUseCase implements IAtualizarParticipacaoUseCase {
  constructor(
    @Inject(PARTICIPACAO_LOTE_REPOSITORY)
    private readonly repository: IParticipacaoLoteRepository,
  ) {}

  async execute(loteId: string, associadoId: string, input: AtualizarParticipacaoInput): Promise<ParticipacaoLote> {
    const existente = await this.repository.findByAssociadoELote(associadoId, loteId)
    if (!existente) throw new NotFoundException('Participação não encontrada')

    const atualizada = new ParticipacaoLote({
      id: existente.id,
      loteProducaoId: existente.loteProducaoId,
      associadoId: existente.associadoId,
      percentual: input.percentual ?? existente.percentual,
      volume: input.volume ?? existente.volume,
      valorInvestido: input.valorInvestido ?? existente.valorInvestido,
    })

    return this.repository.update(atualizada)
  }
}
