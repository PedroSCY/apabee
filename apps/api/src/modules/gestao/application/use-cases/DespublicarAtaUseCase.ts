import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Ata, IAtaRepository, IDespublicarAtaUseCase } from '@apa/core'
import { ATA_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class DespublicarAtaUseCase implements IDespublicarAtaUseCase {
  constructor(@Inject(ATA_REPOSITORY) private readonly repository: IAtaRepository) {}

  async execute(id: string): Promise<Ata> {
    const ata = await this.repository.findById(id)
    if (!ata) throw new NotFoundException('Ata não encontrada')
    return this.repository.update(ata.despublicar())
  }
}
