import { Inject, Injectable } from '@nestjs/common'
import { ParticipanteAta, IParticipanteAtaRepository, IListarParticipantesAtaUseCase } from '@apa/core'
import { PARTICIPANTE_ATA_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class ListarParticipantesAtaUseCase implements IListarParticipantesAtaUseCase {
  constructor(
    @Inject(PARTICIPANTE_ATA_REPOSITORY)
    private readonly repository: IParticipanteAtaRepository,
  ) {}

  async execute(ataId: string): Promise<ParticipanteAta[]> {
    return this.repository.findByAta(ataId)
  }
}
