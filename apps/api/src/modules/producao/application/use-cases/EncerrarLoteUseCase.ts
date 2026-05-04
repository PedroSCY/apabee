import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IEncerrarLoteUseCase, ILoteProducaoRepository, LoteProducao } from '@apa/core'
import { LOTE_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class EncerrarLoteUseCase implements IEncerrarLoteUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly repository: ILoteProducaoRepository,
  ) {}

  async execute(id: string): Promise<LoteProducao> {
    const lote = await this.repository.findById(id)
    if (!lote) throw new NotFoundException('Lote de produção não encontrado')
    try {
      return await this.repository.update(lote.encerrar())
    } catch (e) {
      throw new BadRequestException((e as Error).message)
    }
  }
}
