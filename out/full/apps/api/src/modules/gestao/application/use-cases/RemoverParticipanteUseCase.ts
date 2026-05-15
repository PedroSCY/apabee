import { Inject, Injectable } from '@nestjs/common'
import { IParticipanteAtaRepository, IRemoverParticipanteUseCase } from '@apa/core'
import { PARTICIPANTE_ATA_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class RemoverParticipanteUseCase implements IRemoverParticipanteUseCase {
  constructor(
    @Inject(PARTICIPANTE_ATA_REPOSITORY)
    private readonly repository: IParticipanteAtaRepository,
  ) {}

  async execute(participanteId: string): Promise<void> {
    return this.repository.delete(participanteId)
  }
}
