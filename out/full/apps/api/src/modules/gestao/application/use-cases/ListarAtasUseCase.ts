import { Inject, Injectable } from '@nestjs/common'
import { Ata, IAtaRepository, IListarAtasUseCase } from '@apa/core'
import { ATA_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class ListarAtasUseCase implements IListarAtasUseCase {
  constructor(@Inject(ATA_REPOSITORY) private readonly repository: IAtaRepository) {}

  async execute(apenasPublicadas?: boolean): Promise<Ata[]> {
    if (apenasPublicadas) return this.repository.findPublicadas()
    return this.repository.findAll()
  }
}
