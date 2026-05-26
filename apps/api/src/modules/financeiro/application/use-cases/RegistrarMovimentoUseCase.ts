import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import {
  IMovimentoFinanceiroRepository,
  IRegistrarMovimentoUseCase,
  MovimentoFinanceiro,
  RegistrarMovimentoInput,
} from '@apa/core'
import { TipoMovimentoFinanceiro } from '@apa/shared'
import { randomUUID } from 'crypto'
import { MOVIMENTO_FINANCEIRO_REPOSITORY } from '../../financeiro.tokens'

const TIPOS_MANUAIS = [TipoMovimentoFinanceiro.ANTECIPACAO, TipoMovimentoFinanceiro.CUSTO]

@Injectable()
export class RegistrarMovimentoUseCase implements IRegistrarMovimentoUseCase {
  constructor(
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY)
    private readonly movimentoRepo: IMovimentoFinanceiroRepository,
  ) {}

  async execute(input: RegistrarMovimentoInput): Promise<MovimentoFinanceiro> {
    if (!TIPOS_MANUAIS.includes(input.tipo as TipoMovimentoFinanceiro))
      throw new BadRequestException('Apenas ANTECIPACAO e CUSTO podem ser registrados manualmente')
    if (input.valor <= 0)
      throw new BadRequestException('Valor deve ser maior que zero')

    const valor = input.tipo === 'CUSTO' ? -input.valor : input.valor

    return this.movimentoRepo.save(
      new MovimentoFinanceiro({
        id: randomUUID(),
        associadoId: input.associadoId,
        campanhaId: input.campanhaId,
        valor,
        tipo: input.tipo as TipoMovimentoFinanceiro,
        descricao: input.descricao,
        data: input.data ?? new Date(),
      }),
    )
  }
}
