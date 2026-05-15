import { TipoDestinoAquisicao } from '@apa/shared'
import { ItemAquisicao } from '../../entities/ItemAquisicao'

export interface AdicionarItemAquisicaoInput {
  campanhaId: string
  descricao: string
  quantidade: number
  valorEstimado: number
  tipoDestino: TipoDestinoAquisicao
  equipamentoNome?: string
  tipoMateriaPrimaId?: string
}

export interface AtualizarItemAquisicaoInput {
  descricao?: string
  quantidade?: number
  valorEstimado?: number
  tipoDestino?: TipoDestinoAquisicao
  equipamentoNome?: string
  tipoMateriaPrimaId?: string
}

export interface IAdicionarItemAquisicaoUseCase {
  execute(input: AdicionarItemAquisicaoInput): Promise<ItemAquisicao>
}

export interface IListarItensAquisicaoUseCase {
  execute(campanhaId: string): Promise<ItemAquisicao[]>
}

export interface IRemoverItemAquisicaoUseCase {
  execute(id: string): Promise<void>
}

export interface IAtualizarItemAquisicaoUseCase {
  execute(id: string, input: AtualizarItemAquisicaoInput): Promise<ItemAquisicao>
}
