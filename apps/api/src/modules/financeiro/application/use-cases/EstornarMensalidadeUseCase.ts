import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IEstornarMensalidadeUseCase,
  IMensalidadeRepository,
  IMovimentoFinanceiroRepository,
  IPaymentGateway,
  Mensalidade,
  MovimentoFinanceiro,
} from '@apa/core'
import { MetodoPagamentoMensalidade, TipoMovimentoFinanceiro } from '@apa/shared'
import { randomUUID } from 'crypto'
import { MENSALIDADE_REPOSITORY, MOVIMENTO_FINANCEIRO_REPOSITORY, PAYMENT_GATEWAY } from '../../financeiro.tokens'

@Injectable()
export class EstornarMensalidadeUseCase implements IEstornarMensalidadeUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY)
    private readonly movimentoRepo: IMovimentoFinanceiroRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly gateway: IPaymentGateway,
  ) {}

  async execute(mensalidadeId: string): Promise<Mensalidade> {
    const mensalidade = await this.mensalidadeRepo.findById(mensalidadeId)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')

    // Validação dentro da entity (lança BadRequestException se não for PAGO)
    const estornada = mensalidade.estornar()

    // Tentar cancelar no gateway se foi paga online — falha silenciosa (InfinityPay não tem API de cancelamento)
    if (
      mensalidade.temCobrancaAtiva() &&
      mensalidade.metodoPagamento === MetodoPagamentoMensalidade.ONLINE
    ) {
      await this.gateway.cancelarCobranca(mensalidade.cobrancaGatewayId!).catch(() => undefined)
    }

    const [atualizada] = await Promise.all([
      this.mensalidadeRepo.update(estornada),
      this.movimentoRepo.save(
        new MovimentoFinanceiro({
          id: randomUUID(),
          associadoId: mensalidade.associadoId,
          valor: -mensalidade.valor,
          tipo: TipoMovimentoFinanceiro.MENSALIDADE,
          descricao: `Estorno mensalidade ${mensalidade.competenciaLabel}`,
          data: new Date(),
        }),
      ),
    ])

    return atualizada
  }
}
