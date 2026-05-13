import { ComposicaoProduto } from '../../entities/ComposicaoProduto'
import { EstoqueProduto } from '../../entities/EstoqueProduto'
import { Produto } from '../../entities/Produto'

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface CriarComposicaoInput {
  produtoId: string
  tipoMateriaPrimaId: string
  quantidadeNecessaria: number
  unidade: string
}

export interface CriarProdutoInput {
  nome: string
  slug?: string
  descricao: string
  preco: number
  imagemUrl?: string
  loteOrigemId?: string
}

export interface AtualizarProdutoInput {
  produtoId: string
  nome?: string
  slug?: string
  descricao?: string
  preco?: number
  imagemUrl?: string
}

export interface GerarEstoqueInput {
  produtoId: string
  quantidade: number
  loteOrigemId?: string
}

export interface ConsultarCapacidadeInput {
  produtoId: string
  loteId: string
}

export interface ConsultarCapacidadeResponse {
  capacidadeMaxima: number
  loteId: string
}

// ── Use Case Interfaces ───────────────────────────────────────────────────────

export interface ICriarProdutoUseCase {
  execute(input: CriarProdutoInput): Promise<Produto>
}

export interface IListarProdutosUseCase {
  execute(options?: { apenasPublicados?: boolean }): Promise<Produto[]>
}

export interface IBuscarProdutoUseCase {
  execute(id: string): Promise<{ produto: Produto; estoque: EstoqueProduto | null; composicoes: ComposicaoProduto[] }>
}

export interface IAtualizarProdutoUseCase {
  execute(input: AtualizarProdutoInput): Promise<Produto>
}

export interface IPublicarProdutoUseCase {
  execute(produtoId: string): Promise<Produto>
}

export interface IArquivarProdutoUseCase {
  execute(produtoId: string): Promise<Produto>
}

export interface IGerarEstoqueProdutoUseCase {
  execute(input: GerarEstoqueInput): Promise<EstoqueProduto>
}

export interface ICriarComposicaoProdutoUseCase {
  execute(input: CriarComposicaoInput): Promise<ComposicaoProduto>
}

export interface IRemoverComposicaoProdutoUseCase {
  execute(composicaoId: string): Promise<void>
}

export interface IConsultarCapacidadeUseCase {
  execute(input: ConsultarCapacidadeInput): Promise<ConsultarCapacidadeResponse>
}
