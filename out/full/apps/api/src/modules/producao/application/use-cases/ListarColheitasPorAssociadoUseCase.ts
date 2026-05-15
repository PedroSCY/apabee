import { Inject, Injectable } from '@nestjs/common'
import { Colheita, IColheitaRepository, IListarColheitasPorAssociadoUseCase } from '@apa/core'
import { COLHEITA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarColheitasPorAssociadoUseCase implements IListarColheitasPorAssociadoUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly repository: IColheitaRepository,
  ) {}

  execute(associadoId: string): Promise<Colheita[]> {
    return this.repository.findByAssociado(associadoId)
  }
}
