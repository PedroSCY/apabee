import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IQuitarMensalidadeUseCase,
  QuitarMensalidadeInput,
  IMensalidadeRepository,
  IMovimentoFinanceiroRepository,
  MovimentoFinanceiro,
  Mensalidade,
} from '@apa/core'
import { TipoMovimentoFinanceiro } from '@apa/shared'
import { randomUUID } from 'crypto'
import { MENSALIDADE_REPOSITORY, MOVIMENTO_FINANCEIRO_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class QuitarMensalidadeUseCase implements IQuitarMensalidadeUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY)
    private readonly movimentoRepo: IMovimentoFinanceiroRepository,
  ) {}

  async execute(input: QuitarMensalidadeInput): Promise<Mensalidade> {
    const mensalidade = await this.mensalidadeRepo.findById(input.mensalidadeId)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')

    const quitada = mensalidade.quitar(input.metodoPagamento)

    const [atualizada] = await Promise.all([
      this.mensalidadeRepo.update(quitada),
      this.movimentoRepo.save(
        new MovimentoFinanceiro({
          id: randomUUID(),
          associadoId: quitada.associadoId,
          valor: quitada.valor,
          tipo: TipoMovimentoFinanceiro.MENSALIDADE,
          descricao: `Mensalidade ${quitada.competenciaLabel} — ${quitada.metodoPagamento}`,
          data: new Date(),
        }),
      ),
    ])

    return atualizada
  }
}
