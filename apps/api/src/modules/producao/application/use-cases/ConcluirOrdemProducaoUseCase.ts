import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IConcluirOrdemProducaoUseCase, IOrdemProducaoRepository, OrdemProducao } from '@apa/core'
import { StatusOrdemProducao } from '@apa/shared'
import { ORDEM_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ConcluirOrdemProducaoUseCase implements IConcluirOrdemProducaoUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly repository: IOrdemProducaoRepository,
  ) {}

  async execute(id: string): Promise<OrdemProducao> {
    const ordem = await this.repository.findById(id)
    if (!ordem) throw new NotFoundException('Ordem de produção não encontrada')
    if (ordem.status !== StatusOrdemProducao.EM_EXECUCAO)
      throw new BadRequestException('Apenas ordens EM_EXECUCAO podem ser concluídas manualmente')
    return this.repository.update(
      ordem.concluir(ordem.produtosGerados ?? ordem.quantidade, ordem.materiaisConsumidos),
    )
  }
}
