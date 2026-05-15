import { Inject, Injectable } from '@nestjs/common'
import { Aviso, IAvisoRepository, IListarAvisosUseCase } from '@apa/core'
import { AVISO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class ListarAvisosUseCase implements IListarAvisosUseCase {
  constructor(
    @Inject(AVISO_REPOSITORY) private readonly avisoRepo: IAvisoRepository,
  ) {}

  async execute(apenasPublicados = false): Promise<Aviso[]> {
    return this.avisoRepo.findAll(apenasPublicados)
  }
}
