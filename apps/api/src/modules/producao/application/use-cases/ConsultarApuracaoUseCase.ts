import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ApuracaoCampanha, IApuracaoCampanhaRepository, IConsultarApuracaoUseCase } from '@apa/core'
import { APURACAO_CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ConsultarApuracaoUseCase implements IConsultarApuracaoUseCase {
  constructor(
    @Inject(APURACAO_CAMPANHA_REPOSITORY)
    private readonly repository: IApuracaoCampanhaRepository,
  ) {}

  async execute(campanhaId: string): Promise<ApuracaoCampanha> {
    const apuracao = await this.repository.findByCampanha(campanhaId)
    if (!apuracao) throw new NotFoundException('Apuração não encontrada para esta campanha')
    return apuracao
  }
}
