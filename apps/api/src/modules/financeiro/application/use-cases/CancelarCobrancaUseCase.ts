import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICancelarCobrancaUseCase, IMensalidadeRepository, IPaymentGateway, Mensalidade } from '@apa/core'
import { MENSALIDADE_REPOSITORY, PAYMENT_GATEWAY } from '../../financeiro.tokens'

@Injectable()
export class CancelarCobrancaUseCase implements ICancelarCobrancaUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly gateway: IPaymentGateway,
  ) {}

  async execute(mensalidadeId: string): Promise<Mensalidade> {
    const mensalidade = await this.mensalidadeRepo.findById(mensalidadeId)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')
    if (!mensalidade.temCobrancaAtiva()) {
      throw new BadRequestException('Esta mensalidade não possui cobrança ativa no gateway de pagamento.')
    }

    await this.gateway.cancelarCobranca(mensalidade.cobrancaGatewayId!)
    return this.mensalidadeRepo.update(mensalidade.semCobranca())
  }
}
