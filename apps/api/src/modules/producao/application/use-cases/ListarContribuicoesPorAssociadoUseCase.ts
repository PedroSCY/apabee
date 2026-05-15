import { Inject, Injectable } from '@nestjs/common'
import { Contribuicao, IContribuicaoRepository, IListarContribuicoesPorAssociadoUseCase } from '@apa/core'
import { CONTRIBUICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarContribuicoesPorAssociadoUseCase implements IListarContribuicoesPorAssociadoUseCase {
  constructor(
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly repository: IContribuicaoRepository,
  ) {}

  execute(associadoId: string): Promise<Contribuicao[]> {
    return this.repository.findByAssociado(associadoId)
  }
}
