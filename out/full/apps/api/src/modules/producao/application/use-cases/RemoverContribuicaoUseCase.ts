import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICampanhaRepository, IContribuicaoRepository, IRemoverContribuicaoUseCase } from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY, CONTRIBUICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RemoverContribuicaoUseCase implements IRemoverContribuicaoUseCase {
  constructor(
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const contribuicao = await this.contribuicaoRepo.findById(id)
    if (!contribuicao) throw new NotFoundException('Contribuição não encontrada')

    const campanha = await this.campanhaRepo.findById(contribuicao.campanhaId)
    if (campanha && campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Contribuições só podem ser removidas de campanhas ATIVAS')

    await this.contribuicaoRepo.delete(id)
  }
}
