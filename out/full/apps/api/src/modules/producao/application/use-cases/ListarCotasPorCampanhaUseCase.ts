import { Inject, Injectable } from '@nestjs/common'
import { Cota, ICotaRepository, IListarCotasPorCampanhaUseCase } from '@apa/core'
import { COTA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarCotasPorCampanhaUseCase implements IListarCotasPorCampanhaUseCase {
  constructor(
    @Inject(COTA_REPOSITORY)
    private readonly repository: ICotaRepository,
  ) {}

  execute(campanhaId: string): Promise<Cota[]> {
    return this.repository.findByCampanha(campanhaId)
  }
}
