import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Campanha, IBuscarCampanhaUseCase, ICampanhaRepository } from '@apa/core'
import { CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class BuscarCampanhaUseCase implements IBuscarCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
  ) {}

  async execute(id: string): Promise<Campanha> {
    const campanha = await this.repository.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    return campanha
  }
}
