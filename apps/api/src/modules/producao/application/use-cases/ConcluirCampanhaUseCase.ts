import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Campanha, ICampanhaRepository, IConcluirCampanhaUseCase, IOrdemProducaoRepository } from '@apa/core'
import { StatusCampanha, StatusOrdemProducao } from '@apa/shared'
import { CAMPANHA_REPOSITORY, ORDEM_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ConcluirCampanhaUseCase implements IConcluirCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
  ) {}

  async execute(id: string): Promise<Campanha> {
    const campanha = await this.repository.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Apenas campanhas ATIVAS podem ser concluídas')

    const ordensRascunho = await this.ordemRepo.findByCampanha(id, [StatusOrdemProducao.RASCUNHO])
    if (ordensRascunho.length > 0)
      throw new ConflictException(
        `Existem ${ordensRascunho.length} ordem(ns) de produção em rascunho. Confirme ou remova antes de concluir a campanha.`,
      )

    return this.repository.update(campanha.concluir())
  }
}
