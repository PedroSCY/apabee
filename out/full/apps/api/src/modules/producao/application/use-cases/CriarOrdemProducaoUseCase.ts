import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  CriarOrdemProducaoInput,
  ICampanhaRepository,
  ICriarOrdemProducaoUseCase,
  IOrdemProducaoRepository,
  OrdemProducao,
} from '@apa/core'
import { StatusCampanha, StatusOrdemProducao, TipoLote } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY, ORDEM_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class CriarOrdemProducaoUseCase implements ICriarOrdemProducaoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ORDEM_PRODUCAO_REPOSITORY)
    private readonly ordemRepo: IOrdemProducaoRepository,
  ) {}

  async execute(input: CriarOrdemProducaoInput): Promise<OrdemProducao> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.tipo !== TipoLote.PRODUCAO)
      throw new BadRequestException('Ordens de produção só são permitidas em campanhas de PRODUCAO')
    if (campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Ordens de produção só podem ser criadas em campanhas ATIVAS')
    if (input.quantidade <= 0)
      throw new BadRequestException('Quantidade deve ser maior que zero')

    const ordem = new OrdemProducao({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      produtoId: input.produtoId,
      quantidade: input.quantidade,
      status: StatusOrdemProducao.PENDENTE,
      perdaPercentual: input.perdaPercentual ?? 0,
      materiaisConsumidos: [],
      criadoEm: new Date(),
    })
    return this.ordemRepo.save(ordem)
  }
}
