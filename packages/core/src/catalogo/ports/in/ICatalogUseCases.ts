import { StatusProduto } from '@apa/shared'
import { ComposicaoProduto } from '../../entities/ComposicaoProduto'
import { EstoqueProduto } from '../../entities/EstoqueProduto'
import { Produto } from '../../entities/Produto'

// ── Inputs ────────────────────────────────────────────────────────────────────

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
