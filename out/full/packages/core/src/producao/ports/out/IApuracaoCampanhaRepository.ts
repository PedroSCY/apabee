import { ApuracaoCampanha } from '../../entities/ApuracaoCampanha'

/** Repositório de apurações e rateios de campanhas liquidadas. */
export interface IApuracaoCampanhaRepository {
  findByCampanha(campanhaId: string): Promise<ApuracaoCampanha | null>
  save(apuracao: ApuracaoCampanha): Promise<ApuracaoCampanha>
}
