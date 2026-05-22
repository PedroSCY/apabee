import { Inject, Injectable } from '@nestjs/common'
import { EstoqueCampanha, IEstoqueCampanhaRepository, IListarEstoqueCampanhaUseCase } from '@apa/core'
import { ESTOQUE_CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarEstoqueCampanhaUseCase implements IListarEstoqueCampanhaUseCase {
  constructor(
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly repository: IEstoqueCampanhaRepository,
  ) {}

  execute(campanhaId: string): Promise<EstoqueCampanha[]> {
    return this.repository.findByCampanha(campanhaId)
  }
}
