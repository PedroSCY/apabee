import { Inject, Injectable } from '@nestjs/common'
import { IListarOrdensPorCampanhaUseCase, IOrdemProducaoRepository, OrdemProducao } from '@apa/core'
import { ORDEM_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarOrdensPorCampanhaUseCase implements IListarOrdensPorCampanhaUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly repository: IOrdemProducaoRepository,
  ) {}

  execute(campanhaId: string): Promise<OrdemProducao[]> {
    return this.repository.findByCampanha(campanhaId)
  }
}
