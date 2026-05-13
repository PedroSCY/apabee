import { Inject, Injectable } from '@nestjs/common'
import { IListarLotesUseCase, ILoteProducaoRepository, LoteProducao } from '@apa/core'
import { LOTE_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
/** Lista todos os lotes de produção cadastrados. */
export class ListarLotesUseCase implements IListarLotesUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly repository: ILoteProducaoRepository,
  ) {}

  /** Executa a listagem de todos os lotes. */
  execute(): Promise<LoteProducao[]> {
    return this.repository.findAll()
  }
}
