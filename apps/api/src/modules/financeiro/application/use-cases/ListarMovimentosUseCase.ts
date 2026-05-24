import { Inject, Injectable } from '@nestjs/common'
import {
  IListarMovimentosUseCase,
  IMovimentoFinanceiroRepository,
  ListarMovimentosInput,
  MovimentoFinanceiro,
} from '@apa/core'
import { MOVIMENTO_FINANCEIRO_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class ListarMovimentosUseCase implements IListarMovimentosUseCase {
  constructor(
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY)
    private readonly movimentoRepo: IMovimentoFinanceiroRepository,
  ) {}

  async execute(input?: ListarMovimentosInput): Promise<MovimentoFinanceiro[]> {
    return this.movimentoRepo.findAll(input)
  }
}
