import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ApuracaoCampanha,
  IApuracaoCampanhaRepository,
  ICampanhaRepository,
  ICotaRepository,
  IDistribuirItensUseCase,
} from '@apa/core'
import { DestinatarioCampanha, StatusCampanha } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  APURACAO_CAMPANHA_REPOSITORY,
  CAMPANHA_REPOSITORY,
  COTA_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
/** Liquida uma campanha de AQUISIÇÃO destinada à APA: gera ApuracaoCampanha com base nas cotas pagas. Não se aplica a campanhas INDIVIDUAL (liquidadas pelos pedidos). */
export class DistribuirItensUseCase implements IDistribuirItensUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(COTA_REPOSITORY)
    private readonly cotaRepo: ICotaRepository,
    @Inject(APURACAO_CAMPANHA_REPOSITORY)
    private readonly apuracaoRepo: IApuracaoCampanhaRepository,
  ) {}

  async execute(campanhaId: string): Promise<ApuracaoCampanha> {
    const campanha = await this.campanhaRepo.findById(campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.CONCLUIDA)
      throw new BadRequestException('A conclusão só pode ocorrer em campanhas CONCLUIDAS')
    if (campanha.destinatario === DestinatarioCampanha.INDIVIDUAL)
      throw new BadRequestException('Campanhas INDIVIDUAL são liquidadas diretamente via liquidar — os pedidos registram a entrega individual dos itens')

    const cotasPagas = (await this.cotaRepo.findByCampanha(campanhaId)).filter(c => c.pago)
    const totalArrecadado = cotasPagas.reduce((s, c) => s + c.valor, 0)

    const rateios = cotasPagas
      .filter(c => c.associadoId)
      .map(cota => ({
        associadoId: cota.associadoId!,
        contribuicaoTotal: cota.valor,
        percentual: totalArrecadado > 0 ? cota.valor / totalArrecadado : 0,
        valorBruto: cota.valor,
        custosRateados: 0,
        antecipacoes: 0,
        valorFinal: cota.valor,
      }))

    const apuracao = await this.apuracaoRepo.save(
      new ApuracaoCampanha({
        id: randomUUID(),
        campanhaId,
        faturamentoTotal: totalArrecadado,
        custoTotal: 0,
        lucroLiquido: 0,
        liquidadoEm: new Date(),
        rateios,
      }),
    )

    await this.campanhaRepo.update(campanha.liquidar(totalArrecadado, 0))
    return apuracao
  }
}
