import { Inject, Injectable } from '@nestjs/common'
import { IListarParticipacoesPorLoteUseCase, IParticipacaoLoteRepository, ParticipacaoLote } from '@apa/core'
import { PARTICIPACAO_LOTE_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarParticipacoesPorLoteUseCase implements IListarParticipacoesPorLoteUseCase {
  constructor(
    @Inject(PARTICIPACAO_LOTE_REPOSITORY)
    private readonly repository: IParticipacaoLoteRepository,
  ) {}

  execute(loteId: string): Promise<ParticipacaoLote[]> {
    return this.repository.findByLote(loteId)
  }
}
