import { ApuracaoCampanha } from '../../entities/ApuracaoCampanha'

export interface IConsultarApuracaoUseCase {
  execute(campanhaId: string): Promise<ApuracaoCampanha>
}
