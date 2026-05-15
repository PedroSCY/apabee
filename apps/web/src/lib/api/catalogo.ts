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
  campanhaId?: string
  criadoEm: string
  quantidadeEstoque: number
}

export interface CriarProdutoInput {
  nome: string
  descricao: string
  preco: number
  slug?: string
  imagemUrl?: string
  campanhaId?: string
}

export interface AtualizarProdutoInput {
  nome?: string
  descricao?: string
  preco?: number
  slug?: string
  imagemUrl?: string
}

export const catalogoApi = {
  /** Lista produtos, opcionalmente apenas os publicados. */
  listarProdutos: (apenasPublicados = false) =>
    apiFetch<ProdutoResponse[]>(
      `/catalogo/produtos${apenasPublicados ? '?publicos=true' : ''}`,
    ),

  /** Busca um produto pelo ID com estoque. */
  buscarProduto: (id: string) =>
    apiFetch<ProdutoResponse & { estoque: { quantidadeDisponivel: number } | null }>(`/catalogo/produtos/${id}`),

  /** Cria um novo produto. */
  criarProduto: (input: CriarProdutoInput) =>
    apiFetch<ProdutoResponse>('/catalogo/produtos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Atualiza dados de um produto. */
  atualizarProduto: (id: string, input: AtualizarProdutoInput) =>
    apiFetch<ProdutoResponse>(`/catalogo/produtos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Publica um produto (torna visível na loja). */
  publicarProduto: (id: string) =>
    apiFetch<void>(`/catalogo/produtos/${id}/publicar`, { method: 'PATCH' }),

  /** Arquiva um produto (oculta da loja). */
  arquivarProduto: (id: string) =>
    apiFetch<void>(`/catalogo/produtos/${id}/arquivar`, { method: 'PATCH' }),

  /** Exclui permanentemente um produto (apenas RASCUNHO ou ARQUIVADO). */
  deletarProduto: (id: string) =>
    apiFetch<void>(`/catalogo/produtos/${id}`, { method: 'DELETE' }),

  /** Gera ou atualiza o estoque de um produto. */
  gerarEstoque: (id: string, quantidade: number, campanhaId?: string) =>
    apiFetch<{ id: string; produtoId: string; quantidadeDisponivel: number }>(
      `/catalogo/produtos/${id}/gerar-estoque`,
      { method: 'POST', body: JSON.stringify({ quantidade, campanhaId }) },
    ),

  /** Consulta a capacidade máxima de produção de uma campanha para um produto. */
  consultarCapacidade: (produtoId: string, campanhaId: string) =>
    apiFetch<{ capacidadeMaxima: number; campanhaId: string }>(
      `/catalogo/produtos/${produtoId}/capacidade?campanhaId=${campanhaId}`,
    ),

  /** Retorna a composição (matérias-primas) de um produto. */
  buscarComposicoes: (id: string) =>
    apiFetch<{ composicoes: ComposicaoResponse[] }>(`/catalogo/produtos/${id}`).then(
      (r) => r.composicoes ?? [],
    ),

  /** Adiciona matéria-prima à composição de um produto. */
  adicionarComposicao: (id: string, input: AdicionarComposicaoInput) =>
    apiFetch<ComposicaoResponse>(`/catalogo/produtos/${id}/composicoes`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Remove uma matéria-prima da composição de um produto. */
  removerComposicao: (produtoId: string, composicaoId: string) =>
    apiFetch<void>(`/catalogo/produtos/${produtoId}/composicoes/${composicaoId}`, {
      method: 'DELETE',
    }),

  /** Lista todos os tipos de matéria-prima disponíveis. */
  listarTiposMateriaPrima: () =>
    apiFetch<TipoMateriaPrimaResponse[]>('/producao/tipos-materia-prima'),
}
