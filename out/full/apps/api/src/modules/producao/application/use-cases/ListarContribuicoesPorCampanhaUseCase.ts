import { Inject, Injectable } from '@nestjs/common'
import { Contribuicao, IContribuicaoRepository, IListarContribuicoesPorCampanhaUseCase } from '@apa/core'
import { CONTRIBUICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarContribuicoesPorCampanhaUseCase implements IListarContribuicoesPorCampanhaUseCase {
  constructor(
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly repository: IContribuicaoRepository,
  ) {}

  execute(campanhaId: string): Promise<Contribuicao[]> {
    return this.repository.findByCampanha(campanhaId)
  }
}
