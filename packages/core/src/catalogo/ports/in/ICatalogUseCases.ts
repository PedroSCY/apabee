import { ComposicaoProduto } from '../../entities/ComposicaoProduto'
import { EstoqueProduto } from '../../entities/EstoqueProduto'
import { Produto } from '../../entities/Produto'

// ── Inputs ────────────────────────────────────────────────────────────────────

/** Dados de entrada para criar uma composição de produto. */
export interface CriarComposicaoInput {
  produtoId: string
  tipoMateriaPrimaId: string
  quantidadeNecessaria: number
}

/** Dados de entrada para criar um novo produto. */
export interface CriarProdutoInput {
  nome: string
  slug?: string
  descricao: string
  preco: number
  imagemUrl?: string
  campanhaId?: string
}

/** Dados de entrada para atualizar um produto existente. */
export interface AtualizarProdutoInput {
  produtoId: string
  nome?: string
  slug?: string
  descricao?: string
  preco?: number
  imagemUrl?: string
}

/** Dados de entrada para gerar estoque de produto a partir de uma campanha. */
export interface GerarEstoqueInput {
  produtoId: string
  quantidade: number
  campanhaId?: string
}

/** Dados de entrada para consultar capacidade de produção a partir de uma campanha. */
export interface ConsultarCapacidadeInput {
  produtoId: string
  campanhaId: string
}

/** Resposta da consulta de capacidade de produção. */
export interface ConsultarCapacidadeResponse {
  capacidadeMaxima: number
  campanhaId: string
}

// ── Use Case Interfaces ───────────────────────────────────────────────────────

/** Use case: criar um novo produto no catálogo. */
export interface ICriarProdutoUseCase {
  execute(input: CriarProdutoInput): Promise<Produto>
}

/** Use case: listar produtos, com opção de filtrar apenas publicados. */
export interface IListarProdutosUseCase {
  execute(options?: { apenasPublicados?: boolean }): Promise<Produto[]>
}

/** Use case: buscar produto por ID com estoque e composições. */
export interface IBuscarProdutoUseCase {
  execute(id: string): Promise<{ produto: Produto; estoque: EstoqueProduto | null; composicoes: ComposicaoProduto[] }>
}

/** Use case: atualizar dados de um produto existente. */
export interface IAtualizarProdutoUseCase {
  execute(input: AtualizarProdutoInput): Promise<Produto>
}

/** Use case: publicar um produto (status PUBLICADO). */
export interface IPublicarProdutoUseCase {
  execute(produtoId: string): Promise<Produto>
}

/** Use case: arquivar um produto (status ARQUIVADO). */
export interface IArquivarProdutoUseCase {
  execute(produtoId: string): Promise<Produto>
}

/** Use case: excluir permanentemente um produto (apenas RASCUNHO ou ARQUIVADO). */
export interface IDeletarProdutoUseCase {
  execute(produtoId: string): Promise<void>
}

/** Use case: gerar estoque de produto consumindo matéria-prima. */
export interface IGerarEstoqueProdutoUseCase {
  execute(input: GerarEstoqueInput): Promise<EstoqueProduto>
}

/** Use case: criar composição (receita) de um produto. */
export interface ICriarComposicaoProdutoUseCase {
  execute(input: CriarComposicaoInput): Promise<ComposicaoProduto>
}

/** Use case: remover uma composição de produto. */
export interface IRemoverComposicaoProdutoUseCase {
  execute(composicaoId: string): Promise<void>
}

/** Use case: consultar a capacidade máxima de produção para um lote. */
export interface IConsultarCapacidadeUseCase {
  execute(input: ConsultarCapacidadeInput): Promise<ConsultarCapacidadeResponse>
}

export interface ProdutoComEstoqueItem {
  produto: Produto
  quantidadeEstoque: number
}

/** Use case: listar produtos com quantidade de estoque disponível. */
export interface IListarProdutosComEstoqueUseCase {
  execute(options?: { apenasPublicados?: boolean }): Promise<ProdutoComEstoqueItem[]>
}
