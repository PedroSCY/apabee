import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { TipoLote } from '@apa/shared'
import {
  ICalcularRateioUseCase,
  ILoteProducaoRepository,
  IParticipacaoLoteRepository,
  ParticipacaoLote,
} from '@apa/core'
import { LOTE_PRODUCAO_REPOSITORY, PARTICIPACAO_LOTE_REPOSITORY } from '../../producao.tokens'

@Injectable()
/** Recalcula os percentuais de rateio entre os participantes de um lote. */
export class CalcularRateioUseCase implements ICalcularRateioUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly loteRepository: ILoteProducaoRepository,
    @Inject(PARTICIPACAO_LOTE_REPOSITORY)
    private readonly participacaoRepository: IParticipacaoLoteRepository,
  ) {}

  /** Executa o rateio proporcional ao volume (produção) ou valor investido (aquisição). */
  async execute(loteId: string): Promise<ParticipacaoLote[]> {
    const lote = await this.loteRepository.findById(loteId)
    if (!lote) throw new NotFoundException('Lote não encontrado')

    const participacoes = await this.participacaoRepository.findByLote(loteId)
    if (participacoes.length === 0) return []

    const manuais = participacoes.filter((p) => p.percentualManual)
    const automaticas = participacoes.filter((p) => !p.percentualManual)

    if (automaticas.length === 0) return participacoes

    const percentualManualTotal = manuais.reduce((sum, p) => sum + p.percentual, 0)
    const percentualDisponivel = 100 - percentualManualTotal

    const totalBase = automaticas.reduce((sum, p) => {
      return sum + (lote.tipo === TipoLote.PRODUCAO ? (p.volume ?? 0) : (p.valorInvestido ?? 0))
    }, 0)

    const atualizadas = automaticas.map((p) => {
      const base = lote.tipo === TipoLote.PRODUCAO ? (p.volume ?? 0) : (p.valorInvestido ?? 0)
      const percentual = totalBase > 0
        ? Math.round((base / totalBase) * percentualDisponivel * 100) / 100
        : 0
      return new ParticipacaoLote({
        id: p.id,
        loteProducaoId: p.loteProducaoId,
        associadoId: p.associadoId,
        percentual,
        percentualManual: false,
        volume: p.volume,
        valorInvestido: p.valorInvestido,
      })
    })

    if (atualizadas.length > 0) {
      await this.participacaoRepository.updateMany(atualizadas)
    }

    return [...manuais, ...atualizadas]
  }
}
