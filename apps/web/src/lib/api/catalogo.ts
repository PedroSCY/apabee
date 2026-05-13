import { apiFetch } from './client'

export interface TipoMateriaPrimaResponse {
  id: string
  nome: string
  unidade: string
  descricao?: string
}

export interface ComposicaoResponse {
  id: string
  tipoMateriaPrimaId: string
  quantidadeNecessaria: number
  unidade: string
}

export interface AdicionarComposicaoInput {
  tipoMateriaPrimaId: string
  quantidadeNecessaria: number
  unidade: string
}

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

  gerarEstoque: (id: string, quantidade: number, loteOrigemId?: string) =>
    apiFetch<{ id: string; produtoId: string; quantidadeDisponivel: number }>(
      `/catalogo/produtos/${id}/gerar-estoque`,
      { method: 'POST', body: JSON.stringify({ quantidade, loteOrigemId }) },
    ),

  consultarCapacidade: (produtoId: string, loteId: string) =>
    apiFetch<{ capacidadeMaxima: number; loteId: string }>(
      `/catalogo/produtos/${produtoId}/capacidade?loteId=${loteId}`,
    ),

  buscarComposicoes: (id: string) =>
    apiFetch<{ composicoes: ComposicaoResponse[] }>(`/catalogo/produtos/${id}`).then(
      (r) => r.composicoes ?? [],
    ),

  adicionarComposicao: (id: string, input: AdicionarComposicaoInput) =>
    apiFetch<ComposicaoResponse>(`/catalogo/produtos/${id}/composicoes`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  removerComposicao: (produtoId: string, composicaoId: string) =>
    apiFetch<void>(`/catalogo/produtos/${produtoId}/composicoes/${composicaoId}`, {
      method: 'DELETE',
    }),

  listarTiposMateriaPrima: () =>
    apiFetch<TipoMateriaPrimaResponse[]>('/producao/tipos-materia-prima'),
}
