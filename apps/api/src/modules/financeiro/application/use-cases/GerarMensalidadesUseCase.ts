import { Inject, Injectable, BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  IGerarMensalidadesUseCase,
  GerarMensalidadesInput,
  IMensalidadeRepository,
  IConfiguracaoAssociacaoRepository,
  IAssociadoRepository,
  Mensalidade,
} from '@apa/core'
import { StatusMensalidade, StatusAssociado } from '@apa/shared'
import { MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'
import { CONFIGURACAO_REPOSITORY } from '../../../gestao/gestao.tokens'
import { ASSOCIADO_REPOSITORY } from '../../../identidade/identidade.tokens'

@Injectable()
export class GerarMensalidadesUseCase implements IGerarMensalidadesUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(CONFIGURACAO_REPOSITORY)
    private readonly configuracaoRepo: IConfiguracaoAssociacaoRepository,
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepo: IAssociadoRepository,
  ) {}

  async execute(input: GerarMensalidadesInput): Promise<Mensalidade[]> {
    const { competenciaAno, competenciaMes } = input

    if (competenciaMes < 1 || competenciaMes > 12) {
      throw new BadRequestException('Mês de competência inválido.')
    }

    const configuracao = await this.configuracaoRepo.findOne()
    const valorBase = input.valorPadrao ?? configuracao?.valorMensalidade

    if (!valorBase || valorBase <= 0) {
      throw new BadRequestException(
        'Valor de mensalidade não configurado. Defina em Configurações ou informe valorPadrao.',
      )
    }

    const associados = await this.associadoRepo.findAll()
    const associadosAtivos = associados.filter(
      (a) => a.status === StatusAssociado.ATIVO && !a.isentoMensalidade,
    )

    const geradas: Mensalidade[] = []

    for (const associado of associadosAtivos) {
      const jaExiste = await this.mensalidadeRepo.findByAssociadoECompetencia(
        associado.id,
        competenciaAno,
        competenciaMes,
      )
      if (jaExiste) continue

      geradas.push(
        new Mensalidade({
          id: randomUUID(),
          associadoId: associado.id,
          competenciaAno,
          competenciaMes,
          valor: valorBase,
          status: StatusMensalidade.PENDENTE,
          criadoEm: new Date(),
        }),
      )
    }

    return this.mensalidadeRepo.saveMany(geradas)
  }
}
