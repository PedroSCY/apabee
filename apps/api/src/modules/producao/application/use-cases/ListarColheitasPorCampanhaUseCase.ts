import { Inject, Injectable } from '@nestjs/common'
import { Colheita, IColheitaRepository, IListarColheitasPorCampanhaUseCase } from '@apa/core'
import { COLHEITA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarColheitasPorCampanhaUseCase implements IListarColheitasPorCampanhaUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly repository: IColheitaRepository,
  ) {}

  execute(campanhaId: string): Promise<Colheita[]> {
    return this.repository.findByCampanha(campanhaId)
  }
}
