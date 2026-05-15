import { Inject, Injectable } from '@nestjs/common'
import { Campanha, ICampanhaRepository, IListarCampanhasUseCase } from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarCampanhasUseCase implements IListarCampanhasUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
  ) {}

  execute(status?: StatusCampanha): Promise<Campanha[]> {
    return this.repository.findAll(status)
  }
}
