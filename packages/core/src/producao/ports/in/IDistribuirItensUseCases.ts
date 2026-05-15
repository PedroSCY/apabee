import { TipoDestinoAquisicao } from '@apa/shared'
import { ApuracaoCampanha } from '../../entities/ApuracaoCampanha'

export interface DistribuicaoCotista {
  associadoId: string
  valorCota: number
  percentual: number
}

export interface DistribuicaoItem {
  itemId: string
  descricao: string
  tipoDestino: TipoDestinoAquisicao
  cotistas: (DistribuicaoCotista & {
    quantidadeRecebida?: number
    equipamentoId?: string
  })[]
}

export interface PreviewDistribuicao {
  totalArrecadado: number
  itens: DistribuicaoItem[]
}

export interface IDistribuirItensUseCase {
  /** Executa a distribuição dos itens adquiridos. Cria Equipamentos ou adiciona ao EstoqueMateriaPrima. Gera ApuracaoCampanha e transiciona para LIQUIDADA. */
  execute(campanhaId: string): Promise<ApuracaoCampanha>
}

export interface ICalcularDistribuicaoPreviewUseCase {
  /** Simula a distribuição sem executar. Retorna preview para o admin confirmar. */
  execute(campanhaId: string): Promise<PreviewDistribuicao>
}
