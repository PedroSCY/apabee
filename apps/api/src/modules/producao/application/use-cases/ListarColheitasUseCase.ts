import { Inject, Injectable } from '@nestjs/common'
import { Colheita, IColheitaRepository, IListarColheitasUseCase } from '@apa/core'
import { COLHEITA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarColheitasUseCase implements IListarColheitasUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly repository: IColheitaRepository,
  ) {}

  execute(): Promise<Colheita[]> {
    return this.repository.findAll()
  }
}
