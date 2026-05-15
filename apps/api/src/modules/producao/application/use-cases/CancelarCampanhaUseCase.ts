import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Campanha, ICampanhaRepository, ICancelarCampanhaUseCase, IContribuicaoRepository } from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY, CONTRIBUICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class CancelarCampanhaUseCase implements ICancelarCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
  ) {}

  async execute(id: string): Promise<Campanha> {
    const campanha = await this.campanhaRepo.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status === StatusCampanha.LIQUIDADA)
      throw new BadRequestException('Campanha liquidada não pode ser cancelada')

    const contribuicoes = await this.contribuicaoRepo.findByCampanha(id)
    if (contribuicoes.length > 0)
      throw new BadRequestException(
        `Campanha possui ${contribuicoes.length} contribuição(ões) registrada(s). Remova-as antes de cancelar`,
      )

    // Transitar para CONCLUIDA com dataFim como sinalização de cancelamento
    return this.campanhaRepo.update(campanha.cancelar())
  }
}
