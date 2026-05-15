import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICampanhaRepository, ICotaRepository, IResumoCaptacaoUseCase, ResumoCaptacao } from '@apa/core'
import { CAMPANHA_REPOSITORY, COTA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ResumoCaptacaoUseCase implements IResumoCaptacaoUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(COTA_REPOSITORY)
    private readonly cotaRepo: ICotaRepository,
  ) {}

  async execute(campanhaId: string): Promise<ResumoCaptacao> {
    const campanha = await this.campanhaRepo.findById(campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')

    const cotas = await this.cotaRepo.findByCampanha(campanhaId)
    const totalArrecadado = cotas.reduce((s, c) => s + c.valor, 0)
    const cotasPagas = cotas.filter(c => c.pago)
    const totalPago = cotasPagas.reduce((s, c) => s + c.valor, 0)
    const meta = campanha.valorMeta ?? 0
    const percentualDaMeta = meta > 0 ? (totalPago / meta) * 100 : 0

    return {
      totalArrecadado,
      totalPago,
      percentualDaMeta,
      quantidadeCotas: cotas.length,
      quantidadeCotasPagas: cotasPagas.length,
    }
  }
}
