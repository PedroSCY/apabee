import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Campanha, IAtualizarReceitaCampanhaUseCase, ICampanhaRepository } from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class AtualizarReceitaCampanhaUseCase implements IAtualizarReceitaCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
  ) {}

  async execute(id: string, receitaTotal: number): Promise<Campanha> {
    if (receitaTotal <= 0)
      throw new BadRequestException('Receita total deve ser maior que zero')
    const campanha = await this.repository.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.CONCLUIDA)
      throw new BadRequestException('Receita total só pode ser informada em campanhas CONCLUIDAS')
    return this.repository.update(campanha.comReceita(receitaTotal))
  }
}
