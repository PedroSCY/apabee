import { apiFetch } from './client'

export interface ProdutoResponse {
  id: string
  nome: string
  slug: string
  descricao: string
  preco: number
  imagemUrl?: string
  status: 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO'
  loteOrigemId?: string
  criadoEm: string
  quantidadeEstoque: number
}

export interface CriarProdutoInput {
  nome: string
  descricao: string
  preco: number
  slug?: string
  imagemUrl?: string
  loteOrigemId?: string
}

export interface AtualizarProdutoInput {
  nome?: string
  descricao?: string
  preco?: number
  slug?: string
  imagemUrl?: string
}

export const catalogoApi = {
  listarProdutos: (apenasPublicados = false) =>
    apiFetch<ProdutoResponse[]>(
      `/catalogo/produtos${apenasPublicados ? '?publicos=true' : ''}`,
    ),

  buscarProduto: (id: string) =>
    apiFetch<ProdutoResponse & { estoque: { quantidadeDisponivel: number } | null }>(`/catalogo/produtos/${id}`),

  criarProduto: (input: CriarProdutoInput) =>
    apiFetch<ProdutoResponse>('/catalogo/produtos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  atualizarProduto: (id: string, input: AtualizarProdutoInput) =>
    apiFetch<ProdutoResponse>(`/catalogo/produtos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  publicarProduto: (id: string) =>
    apiFetch<void>(`/catalogo/produtos/${id}/publicar`, { method: 'PATCH' }),

  arquivarProduto: (id: string) =>
    apiFetch<void>(`/catalogo/produtos/${id}/arquivar`, { method: 'PATCH' }),

  gerarEstoque: (id: string, quantidade: number) =>
    apiFetch<{ id: string; produtoId: string; quantidadeDisponivel: number }>(
      `/catalogo/produtos/${id}/gerar-estoque`,
      { method: 'POST', body: JSON.stringify({ quantidade }) },
    ),
}
