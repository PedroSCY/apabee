import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IAvisoRepository, IExcluirAvisoUseCase } from '@apa/core'
import { AVISO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class ExcluirAvisoUseCase implements IExcluirAvisoUseCase {
  constructor(
    @Inject(AVISO_REPOSITORY) private readonly avisoRepo: IAvisoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const aviso = await this.avisoRepo.findById(id)
    if (!aviso) throw new NotFoundException(`Aviso ${id} não encontrado.`)
    return this.avisoRepo.delete(id)
  }
}
