import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { IEncerrarLoteUseCase, ILoteProducaoRepository } from '@apa/core'
import { ENCERRAR_LOTE_USE_CASE, LOTE_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class EncerrarLotesVencidosService {
  private readonly logger = new Logger(EncerrarLotesVencidosService.name)

  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly loteRepository: ILoteProducaoRepository,
    @Inject(ENCERRAR_LOTE_USE_CASE)
    private readonly encerrarLote: IEncerrarLoteUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async encerrarVencidos(): Promise<void> {
    const vencidos = await this.loteRepository.findAbertosVencidos()
    if (vencidos.length === 0) return

    this.logger.log(`Encerrando ${vencidos.length} lote(s) vencido(s)…`)
    for (const lote of vencidos) {
      try {
        await this.encerrarLote.execute(lote.id)
        this.logger.log(`Lote "${lote.periodo}" (${lote.id}) encerrado automaticamente.`)
      } catch (err) {
        this.logger.error(`Falha ao encerrar lote ${lote.id}: ${(err as Error).message}`)
      }
    }
  }
}
