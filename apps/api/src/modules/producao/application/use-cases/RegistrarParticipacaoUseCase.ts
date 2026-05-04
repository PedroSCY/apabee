import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ILoteProducaoRepository,
  IParticipacaoLoteRepository,
  IRegistrarParticipacaoUseCase,
  ParticipacaoLote,
  RegistrarParticipacaoInput,
} from '@apa/core'
import { randomUUID } from 'crypto'
import { LOTE_PRODUCAO_REPOSITORY, PARTICIPACAO_LOTE_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RegistrarParticipacaoUseCase implements IRegistrarParticipacaoUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly loteRepository: ILoteProducaoRepository,
    @Inject(PARTICIPACAO_LOTE_REPOSITORY)
    private readonly participacaoRepository: IParticipacaoLoteRepository,
  ) {}

  async execute(input: RegistrarParticipacaoInput): Promise<ParticipacaoLote> {
    const lote = await this.loteRepository.findById(input.loteProducaoId)
    if (!lote) throw new NotFoundException('Lote não encontrado')
    if (!lote.estaAberto()) throw new BadRequestException('Lote está encerrado')

    const existente = await this.participacaoRepository.findByAssociadoELote(
      input.associadoId,
      input.loteProducaoId,
    )
    if (existente) throw new BadRequestException('Associado já possui participação neste lote')

    const participacao = new ParticipacaoLote({
      id: randomUUID(),
      loteProducaoId: input.loteProducaoId,
      associadoId: input.associadoId,
      percentual: input.percentual,
      volume: input.volume,
      valorInvestido: input.valorInvestido,
    })

    return this.participacaoRepository.save(participacao)
  }
}
