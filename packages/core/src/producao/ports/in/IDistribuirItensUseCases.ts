import { ApuracaoCampanha } from '../../entities/ApuracaoCampanha'

export interface DistribuicaoCotista {
  associadoId: string
  valorCota: number
  percentual: number
}

export interface DistribuicaoItem {
  itemId: string
  descricao: string
  tipoDestino: string | null
  cotistas: (DistribuicaoCotista & {
    quantidadeRecebida?: number
  })[]
}

export interface PreviewDistribuicao {
  totalArrecadado: number
  itens: DistribuicaoItem[]
}

export interface IDistribuirItensUseCase {
  execute(campanhaId: string): Promise<ApuracaoCampanha>
}

export interface ICalcularDistribuicaoPreviewUseCase {
  execute(campanhaId: string): Promise<PreviewDistribuicao>
}
