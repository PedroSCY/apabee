import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  CustoCampanha,
  ICampanhaRepository,
  ICustoCampanhaRepository,
  IRegistrarCustoUseCase,
  RegistrarCustoInput,
} from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY, CUSTO_CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RegistrarCustoUseCase implements IRegistrarCustoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(CUSTO_CAMPANHA_REPOSITORY)
    private readonly custoRepo: ICustoCampanhaRepository,
  ) {}

  async execute(input: RegistrarCustoInput): Promise<CustoCampanha> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status === StatusCampanha.LIQUIDADA)
      throw new BadRequestException('Não é possível registrar custos em campanha liquidada')
    if (input.valor <= 0)
      throw new BadRequestException('Valor do custo deve ser maior que zero')

    const custo = new CustoCampanha({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      descricao: input.descricao.trim(),
      valor: input.valor,
      categoria: input.categoria,
      pagoPorId: input.pagoPorId,
      comprovanteUrl: input.comprovanteUrl,
      criadoEm: new Date(),
    })
    return this.custoRepo.save(custo)
  }
}
