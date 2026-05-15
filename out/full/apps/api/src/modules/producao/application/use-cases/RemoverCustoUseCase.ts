import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICampanhaRepository, ICustoCampanhaRepository, IRemoverCustoUseCase } from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY, CUSTO_CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RemoverCustoUseCase implements IRemoverCustoUseCase {
  constructor(
    @Inject(CUSTO_CAMPANHA_REPOSITORY)
    private readonly custoRepo: ICustoCampanhaRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const custo = await this.custoRepo.findById(id)
    if (!custo) throw new NotFoundException('Custo não encontrado')

    const campanha = await this.campanhaRepo.findById(custo.campanhaId)
    if (campanha && campanha.status === StatusCampanha.LIQUIDADA)
      throw new BadRequestException('Não é possível remover custos de campanha liquidada')

    await this.custoRepo.delete(id)
  }
}
