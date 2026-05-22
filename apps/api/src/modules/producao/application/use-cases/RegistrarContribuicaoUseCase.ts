import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Contribuicao,
  ICampanhaRepository,
  IContribuicaoRepository,
  IRegistrarContribuicaoUseCase,
  RegistrarContribuicaoInput,
} from '@apa/core'
import { StatusCampanha, TipoContribuicao, TipoLote } from '@apa/shared'
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

    // Valida compatibilidade entre tipo de contribuição e tipo de campanha
    const tipoEsperado = campanha.tipo === TipoLote.PRODUCAO
      ? TipoContribuicao.COLHEITA
      : TipoContribuicao.DINHEIRO
    if (input.tipo !== tipoEsperado)
      throw new BadRequestException(
        `Campanha de ${campanha.tipo === TipoLote.PRODUCAO ? 'PRODUÇÃO' : 'AQUISIÇÃO'} aceita apenas contribuições do tipo ${tipoEsperado}`,
      )

    const contribuicao = new Contribuicao({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      associadoId: input.associadoId,
      tipo: input.tipo,
      valorMonetario: input.valorMonetario,
      colheitaId: input.colheitaId,
      volume: input.volume,
      tipoMateriaPrimaId: input.tipoMateriaPrimaId,
      descricao: input.descricao?.trim(),
      liquidado: false,
      criadoEm: new Date(),
    })
    return this.contribuicaoRepo.save(contribuicao)
  }
}
