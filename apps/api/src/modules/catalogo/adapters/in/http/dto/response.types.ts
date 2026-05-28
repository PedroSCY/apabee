import { StatusProduto } from '@apa/shared'

// ─── Produto ─────────────────────────────────────────────────────────────────

export interface ProdutoResponse {
  id: string
  nome: string
  slug: string
  descricao: string
  preco: number
  imagemUrl?: string
  status: StatusProduto
  campanhaId?: string
  criadoEm: Date
}

export interface ProdutoComEstoqueResponse extends ProdutoResponse {
  quantidadeEstoque: number
}

// ─── Estoque produto ─────────────────────────────────────────────────────────

export interface EstoqueProdutoResponse {
  id: string
  produtoId: string
  quantidadeDisponivel: number
}

// ─── Composição produto ──────────────────────────────────────────────────────

export interface ComposicaoProdutoResponse {
  id: string
  tipoMateriaPrimaId: string
  quantidadeNecessaria: number
}

// ─── Detalhe produto (com estoque + composições) ─────────────────────────────

export interface ProdutoDetalheResponse extends ProdutoResponse {
  estoque: EstoqueProdutoResponse | null
  composicoes: ComposicaoProdutoResponse[]
}

// ─── Capacidade de produção ───────────────────────────────────────────────────

export interface CapacidadeProducaoResponse {
  capacidadeMaxima: number
  campanhaId: string
}
