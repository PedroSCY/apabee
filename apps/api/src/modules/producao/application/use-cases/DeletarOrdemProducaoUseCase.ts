import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IDeletarOrdemProducaoUseCase, IOrdemProducaoRepository } from '@apa/core'
import { StatusOrdemProducao } from '@apa/shared'
import { ORDEM_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class DeletarOrdemProducaoUseCase implements IDeletarOrdemProducaoUseCase {
  constructor(
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly repository: IOrdemProducaoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const ordem = await this.repository.findById(id)
    if (!ordem) throw new NotFoundException('Ordem de produção não encontrada')
    if (ordem.status !== StatusOrdemProducao.RASCUNHO)
      throw new ConflictException('Apenas ordens em RASCUNHO podem ser removidas')
    await this.repository.delete(id)
  }
}
