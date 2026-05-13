import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtualizarParticipacaoInput,
  IAtualizarParticipacaoUseCase,
  ICalcularRateioUseCase,
  IParticipacaoLoteRepository,
  ParticipacaoLote,
} from '@apa/core'
import { CALCULAR_RATEIO_USE_CASE, PARTICIPACAO_LOTE_REPOSITORY } from '../../producao.tokens'

@Injectable()
/** Atualiza os dados de participação de um associado em um lote e recalcula o rateio. */
export class AtualizarParticipacaoUseCase implements IAtualizarParticipacaoUseCase {
  constructor(
    @Inject(PARTICIPACAO_LOTE_REPOSITORY)
    private readonly repository: IParticipacaoLoteRepository,
    @Inject(CALCULAR_RATEIO_USE_CASE)
    private readonly calcularRateio: ICalcularRateioUseCase,
  ) {}

  /** Executa a atualização e aciona o recálculo dos percentuais do lote. */
  async execute(loteId: string, associadoId: string, input: AtualizarParticipacaoInput): Promise<ParticipacaoLote> {
    const existente = await this.repository.findByAssociadoELote(associadoId, loteId)
    if (!existente) throw new NotFoundException('Participação não encontrada')

    const atualizada = new ParticipacaoLote({
      id: existente.id,
      loteProducaoId: existente.loteProducaoId,
      associadoId: existente.associadoId,
      percentual: input.percentualManual ? (input.percentual ?? existente.percentual) : existente.percentual,
      percentualManual: input.percentualManual ?? existente.percentualManual,
      volume: input.volume ?? existente.volume,
      valorInvestido: input.valorInvestido ?? existente.valorInvestido,
    })

    await this.repository.update(atualizada)
    await this.calcularRateio.execute(loteId)

    const recalculada = await this.repository.findByAssociadoELote(associadoId, loteId)
    return recalculada ?? atualizada
  }
}
