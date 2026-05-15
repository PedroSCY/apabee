import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Contribuicao,
  ICampanhaRepository,
  IContribuicaoRepository,
  IRegistrarContribuicaoUseCase,
  RegistrarContribuicaoInput,
} from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY, CONTRIBUICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RegistrarContribuicaoUseCase implements IRegistrarContribuicaoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
  ) {}

  async execute(input: RegistrarContribuicaoInput): Promise<Contribuicao> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Contribuições só podem ser registradas em campanhas ATIVAS')

    const contribuicao = new Contribuicao({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      associadoId: input.associadoId,
      tipo: input.tipo,
      valorMonetario: input.valorMonetario,
      colheitaId: input.colheitaId,
      volume: input.volume,
      tipoMateriaPrimaId: input.tipoMateriaPrimaId,
      horas: input.horas,
      regraCalculo: input.regraCalculo,
      regraParametro: input.regraParametro,
      descricao: input.descricao?.trim(),
      liquidado: false,
      criadoEm: new Date(),
    })
    return this.contribuicaoRepo.save(contribuicao)
  }
}
