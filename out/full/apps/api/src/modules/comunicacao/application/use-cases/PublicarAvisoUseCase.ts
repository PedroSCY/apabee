import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Aviso, IAvisoRepository, IPublicarAvisoUseCase } from '@apa/core'
import { AVISO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class PublicarAvisoUseCase implements IPublicarAvisoUseCase {
  constructor(
    @Inject(AVISO_REPOSITORY) private readonly avisoRepo: IAvisoRepository,
  ) {}

  async execute(id: string): Promise<Aviso> {
    const aviso = await this.avisoRepo.findById(id)
    if (!aviso) throw new NotFoundException(`Aviso ${id} não encontrado.`)
    return this.avisoRepo.update(aviso.publicar())
  }
}
