import { Inject, Injectable } from '@nestjs/common'
import { Colheita, IColheitaRepository, IListarColheitasPorLoteUseCase } from '@apa/core'
import { COLHEITA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarColheitasPorLoteUseCase implements IListarColheitasPorLoteUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly repository: IColheitaRepository,
  ) {}

  execute(loteId: string): Promise<Colheita[]> {
    return this.repository.findByLote(loteId)
  }
}
