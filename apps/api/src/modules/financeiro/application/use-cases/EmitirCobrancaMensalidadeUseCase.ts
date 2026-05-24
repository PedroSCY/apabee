import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  EmitirCobrancaResult,
  IBuscarAssociadoUseCase,
  IEmitirCobrancaMensalidadeUseCase,
  IMensalidadeRepository,
  IPaymentGateway,
} from '@apa/core'
import { BUSCAR_ASSOCIADO_USE_CASE } from '../../../identidade/identidade.tokens'
import { MENSALIDADE_REPOSITORY, PAYMENT_GATEWAY } from '../../financeiro.tokens'

@Injectable()
export class EmitirCobrancaMensalidadeUseCase implements IEmitirCobrancaMensalidadeUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly gateway: IPaymentGateway,
    @Inject(BUSCAR_ASSOCIADO_USE_CASE)
    private readonly buscarAssociado: IBuscarAssociadoUseCase,
  ) {}

  async execute(mensalidadeId: string): Promise<EmitirCobrancaResult> {
    const mensalidade = await this.mensalidadeRepo.findById(mensalidadeId)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')
    if (!mensalidade.isPendente()) {
      throw new BadRequestException(
        `Cobrança só pode ser emitida para mensalidades PENDENTES. Status: ${mensalidade.status}`,
      )
    }
    if (mensalidade.temCobrancaAtiva()) {
      throw new BadRequestException('Esta mensalidade já possui uma cobrança ativa no gateway de pagamento.')
    }

    const associado = await this.buscarAssociado.execute(mensalidade.associadoId)

    const vencimento = new Date()
    vencimento.setDate(vencimento.getDate() + 3)

    const resultado = await this.gateway.criarCobranca({
      referenciaId: mensalidade.id,
      valor: mensalidade.valor,
      descricao: `Mensalidade APA — ${mensalidade.competenciaLabel}`,
      nomeCliente: associado.usuario.nome,
      emailCliente: associado.usuario.email,
      cpfCnpjCliente: associado.cpf,
      vencimento,
      metadata: {
        competenciaAno: String(mensalidade.competenciaAno),
        competenciaMes: String(mensalidade.competenciaMes),
      },
    })

    const atualizada = await this.mensalidadeRepo.update(
      mensalidade.comCobranca(resultado.gatewayId, resultado.linkPagamento, resultado.status, resultado.pixCopiaECola, resultado.valorCobrado),
    )

    return {
      mensalidade: atualizada,
      linkPagamento: resultado.linkPagamento,
      pixCopiaECola: resultado.pixCopiaECola,
      pixQrCodeBase64: resultado.pixQrCodeBase64,
      valorCobrado: resultado.valorCobrado,
    }
  }
}
