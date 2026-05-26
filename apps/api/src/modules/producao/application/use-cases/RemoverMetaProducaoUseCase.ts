import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ICampanhaRepository,
  IMetaProducaoRepository,
  IRemoverMetaProducaoUseCase,
} from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { CAMPANHA_REPOSITORY, META_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RemoverMetaProducaoUseCase implements IRemoverMetaProducaoUseCase {
  constructor(
    @Inject(META_PRODUCAO_REPOSITORY)
    private readonly metaRepo: IMetaProducaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(metaId: string): Promise<void> {
    const meta = await this.metaRepo.findById(metaId)
    if (!meta) throw new NotFoundException('Meta de produção não encontrada')

    const campanha = await this.campanhaRepo.findById(meta.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.PLANEJADA)
      throw new BadRequestException('Metas só podem ser removidas em campanhas com status PLANEJADA')

    await this.metaRepo.delete(metaId)
  }
}
