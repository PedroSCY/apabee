import { Inject, Injectable } from '@nestjs/common'
import { CustoCampanha, ICustoCampanhaRepository, IListarCustosPorCampanhaUseCase } from '@apa/core'
import { CUSTO_CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarCustosPorCampanhaUseCase implements IListarCustosPorCampanhaUseCase {
  constructor(
    @Inject(CUSTO_CAMPANHA_REPOSITORY)
    private readonly repository: ICustoCampanhaRepository,
  ) {}

  execute(campanhaId: string): Promise<CustoCampanha[]> {
    return this.repository.findByCampanha(campanhaId)
  }
}
