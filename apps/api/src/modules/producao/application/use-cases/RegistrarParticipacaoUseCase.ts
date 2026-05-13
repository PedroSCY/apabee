import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { TipoLote } from '@apa/shared'
import {
  ICalcularRateioUseCase,
  ILoteProducaoRepository,
  IParticipacaoLoteRepository,
  IRegistrarParticipacaoUseCase,
  ParticipacaoLote,
  RegistrarParticipacaoInput,
} from '@apa/core'
import { randomUUID } from 'crypto'
import {
  CALCULAR_RATEIO_USE_CASE,
  LOTE_PRODUCAO_REPOSITORY,
  PARTICIPACAO_LOTE_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
/** Registra a participação de um associado em um lote com recálculo automático do rateio. */
export class RegistrarParticipacaoUseCase implements IRegistrarParticipacaoUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly loteRepository: ILoteProducaoRepository,
    @Inject(PARTICIPACAO_LOTE_REPOSITORY)
    private readonly participacaoRepository: IParticipacaoLoteRepository,
    @Inject(CALCULAR_RATEIO_USE_CASE)
    private readonly calcularRateio: ICalcularRateioUseCase,
  ) {}

  /** Executa o registro validando lote aberto, duplicidade e campos obrigatórios por tipo. */
  async execute(input: RegistrarParticipacaoInput): Promise<ParticipacaoLote> {
    const lote = await this.loteRepository.findById(input.loteProducaoId)
    if (!lote) throw new NotFoundException('Lote não encontrado')
    if (!lote.estaAberto()) throw new BadRequestException('Lote está encerrado')

    if (lote.tipo === TipoLote.PRODUCAO && !input.volume) {
      throw new BadRequestException('Lotes de produção requerem o campo volume')
    }
    if (lote.tipo === TipoLote.AQUISICAO && !input.valorInvestido) {
      throw new BadRequestException('Lotes de aquisição requerem o campo valorInvestido')
    }

    const existente = await this.participacaoRepository.findByAssociadoELote(
      input.associadoId,
      input.loteProducaoId,
    )
    if (existente) throw new BadRequestException('Associado já possui participação neste lote')

    const participacao = new ParticipacaoLote({
      id: randomUUID(),
      loteProducaoId: input.loteProducaoId,
      associadoId: input.associadoId,
      percentual: 0,
      percentualManual: false,
      volume: input.volume,
      valorInvestido: input.valorInvestido,
    })

    await this.participacaoRepository.save(participacao)
    const recalculadas = await this.calcularRateio.execute(input.loteProducaoId)
    return recalculadas.find((p) => p.associadoId === input.associadoId) ?? participacao
  }
}
