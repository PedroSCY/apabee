import { Inject, Injectable } from '@nestjs/common'
import { IListarLotesUseCase, ILoteProducaoRepository, LoteProducao } from '@apa/core'
import { LOTE_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarLotesUseCase implements IListarLotesUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly repository: ILoteProducaoRepository,
  ) {}

  execute(): Promise<LoteProducao[]> {
    return this.repository.findAll()
  }
}
