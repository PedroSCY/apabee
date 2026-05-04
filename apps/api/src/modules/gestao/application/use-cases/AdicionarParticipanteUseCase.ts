import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ParticipanteAta, IParticipanteAtaRepository, IAdicionarParticipanteUseCase } from '@apa/core'
import { PARTICIPANTE_ATA_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class AdicionarParticipanteUseCase implements IAdicionarParticipanteUseCase {
  constructor(
    @Inject(PARTICIPANTE_ATA_REPOSITORY)
    private readonly repository: IParticipanteAtaRepository,
  ) {}

  async execute(ataId: string, associadoId: string): Promise<ParticipanteAta> {
    const participante = new ParticipanteAta({ id: randomUUID(), ataId, associadoId })
    return this.repository.save(participante)
  }
}
