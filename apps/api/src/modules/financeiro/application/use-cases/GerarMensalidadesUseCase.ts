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
import { StatusMensalidade, StatusAssociado, TipoNotificacao } from '@apa/shared'
import { MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'
import { CONFIGURACAO_REPOSITORY } from '../../../gestao/gestao.tokens'
import { ASSOCIADO_REPOSITORY } from '../../../identidade/identidade.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'
import { CriarNotificacaoInput } from '@apa/core'

@Injectable()
export class GerarMensalidadesUseCase implements IGerarMensalidadesUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(CONFIGURACAO_REPOSITORY)
    private readonly configuracaoRepo: IConfiguracaoAssociacaoRepository,
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepo: IAssociadoRepository,
    private readonly notificacaoService: NotificacaoService,
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

    const salvas = await this.mensalidadeRepo.saveMany(geradas)

    if (salvas.length > 0) {
      const mesLabel = `${String(competenciaMes).padStart(2, '0')}/${competenciaAno}`
      // Busca usuarioId para cada associado que recebeu mensalidade
      const assocMap = new Map(associadosAtivos.map(a => [a.id, a.usuario.id]))
      const notifs: CriarNotificacaoInput[] = salvas
        .map(m => ({
          userId: assocMap.get(m.associadoId) ?? '',
          tipo: TipoNotificacao.MENSALIDADE_GERADA,
          titulo: `Mensalidade de ${mesLabel} gerada`,
          corpo: `Valor: R$ ${Number(m.valor).toFixed(2).replace('.', ',')}`,
          dadosExtras: { mensalidadeId: m.id },
        }))
        .filter(n => n.userId !== '')
      void this.notificacaoService.enviarParaVarios(notifs)
    }

    return salvas
  }
}
