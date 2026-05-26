import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Campanha,
  ICampanhaRepository,
  IIniciarCampanhaUseCase,
  IMetaProducaoRepository,
  IOrdemProducaoRepository,
  OrdemProducao,
} from '@apa/core'
import { StatusCampanha, StatusOrdemProducao, TipoLote } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  CAMPANHA_REPOSITORY,
  META_PRODUCAO_REPOSITORY,
  ORDEM_PRODUCAO_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
export class IniciarCampanhaUseCase implements IIniciarCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
    @Inject(META_PRODUCAO_REPOSITORY)
    private readonly metaRepo: IMetaProducaoRepository,
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
  ) {}

  async execute(id: string): Promise<Campanha> {
    const campanha = await this.repository.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.PLANEJADA)
      throw new BadRequestException('Apenas campanhas PLANEJADAS podem ser iniciadas')

    const campanhaAtiva = await this.repository.update(campanha.iniciar())

    // Auto-cria OrdemProducao RASCUNHO para cada MetaProducao definida no planejamento
    if (campanhaAtiva.tipo === TipoLote.PRODUCAO) {
      const metas = await this.metaRepo.findByCampanha(id)
      if (metas.length > 0) {
        await Promise.all(metas.map(meta =>
          this.ordemRepo.save(new OrdemProducao({
            id: randomUUID(),
            campanhaId: id,
            produtoId: meta.produtoId,
            quantidade: meta.quantidadePlanejada,
            perdaPercentual: meta.perdaPercentualEstimada ?? 0,
            status: StatusOrdemProducao.RASCUNHO,
            materiaisConsumidos: [],
            criadoEm: new Date(),
          })),
        ))
      }
    }

    return campanhaAtiva
  }
}
