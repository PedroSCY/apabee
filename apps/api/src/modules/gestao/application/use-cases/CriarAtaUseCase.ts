import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Ata, IAtaRepository, ICriarAtaUseCase, CriarAtaInput } from '@apa/core'
import { ATA_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class CriarAtaUseCase implements ICriarAtaUseCase {
  constructor(@Inject(ATA_REPOSITORY) private readonly repository: IAtaRepository) {}

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
    return this.repository.save(ata)
  }
}
