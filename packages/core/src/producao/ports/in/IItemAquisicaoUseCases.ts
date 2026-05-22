import { ItemAquisicao } from '../../entities/ItemAquisicao'

export interface AdicionarItemAquisicaoInput {
  campanhaId: string
  nome: string
  precoUnitario: number
  quantidadeMeta: number
  unidade: string
  tipoDestinoId?: string
}

export interface AtualizarItemAquisicaoInput {
  nome?: string
  precoUnitario?: number
  quantidadeMeta?: number
  unidade?: string
  tipoDestinoId?: string
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
