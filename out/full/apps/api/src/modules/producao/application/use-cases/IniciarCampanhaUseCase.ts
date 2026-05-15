import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Campanha, ICampanhaRepository, IIniciarCampanhaUseCase } from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class IniciarCampanhaUseCase implements IIniciarCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
  ) {}

  async execute(id: string): Promise<Campanha> {
    const campanha = await this.repository.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.PLANEJADA)
      throw new BadRequestException('Apenas campanhas PLANEJADAS podem ser iniciadas')
    return this.repository.update(campanha.iniciar())
  }
}
