import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtualizarContribuicaoInput,
  Contribuicao,
  IAtualizarContribuicaoUseCase,
  ICampanhaRepository,
  IContribuicaoRepository,
} from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY, CONTRIBUICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class AtualizarContribuicaoUseCase implements IAtualizarContribuicaoUseCase {
  constructor(
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(id: string, input: AtualizarContribuicaoInput): Promise<Contribuicao> {
    const contribuicao = await this.contribuicaoRepo.findById(id)
    if (!contribuicao) throw new NotFoundException('Contribuição não encontrada')

    const campanha = await this.campanhaRepo.findById(contribuicao.campanhaId)
    if (!campanha || campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Contribuições só podem ser alteradas em campanhas ATIVAS')

    return this.contribuicaoRepo.update(contribuicao.atualizar(input))
  }
}
