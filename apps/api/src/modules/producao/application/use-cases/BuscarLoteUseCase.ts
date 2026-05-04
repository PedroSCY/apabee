import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IBuscarLoteUseCase, ILoteProducaoRepository, LoteProducao } from '@apa/core'
import { LOTE_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class BuscarLoteUseCase implements IBuscarLoteUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly repository: ILoteProducaoRepository,
  ) {}

  async execute(id: string): Promise<LoteProducao> {
    const lote = await this.repository.findById(id)
    if (!lote) throw new NotFoundException('Lote de produção não encontrado')
    return lote
  }
}
