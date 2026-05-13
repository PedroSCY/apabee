import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Ata, IAtaRepository, ICriarAtaUseCase, CriarAtaInput, IParticipanteAtaRepository, ParticipanteAta } from '@apa/core'
import { ATA_REPOSITORY, PARTICIPANTE_ATA_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class CriarAtaUseCase implements ICriarAtaUseCase {
  constructor(
    @Inject(ATA_REPOSITORY) private readonly repository: IAtaRepository,
    @Inject(PARTICIPANTE_ATA_REPOSITORY) private readonly participanteRepository: IParticipanteAtaRepository,
  ) {}

  async execute(input: CriarAtaInput): Promise<Ata> {
    const ata = new Ata({
      id: randomUUID(),
      titulo: input.titulo,
      conteudo: input.conteudo,
      autorId: input.autorId,
      dataReuniao: input.dataReuniao,
      publicada: input.publicada ?? false,
      criadoEm: new Date(),
    })
    const ataSalva = await this.repository.save(ata)

    if (input.participantesIds?.length) {
      await Promise.all(
        input.participantesIds.map((associadoId) =>
          this.participanteRepository.save(
            new ParticipanteAta({ id: randomUUID(), ataId: ataSalva.id, associadoId }),
          ),
        ),
      )
    }

    return ataSalva
  }
}
