import { Produto } from '../../entities/Produto';
import { EstoqueProduto } from '../../entities/EstoqueProduto';
import { ComposicaoProduto } from '../../entities/ComposicaoProduto';

/** Repositório de produtos do catálogo. */
export interface IProdutoRepository {
  findById(id: string): Promise<Produto | null>;
  findBySlug(slug: string): Promise<Produto | null>;
  findAtivos(): Promise<Produto[]>;
  findAll(): Promise<Produto[]>;
  save(produto: Produto): Promise<Produto>;
  update(produto: Produto): Promise<Produto>;
  delete(id: string): Promise<void>;
}

/** Repositório de estoque de produtos. */
export interface IEstoqueProdutoRepository {
  findByProduto(produtoId: string): Promise<EstoqueProduto | null>;
  save(estoque: EstoqueProduto): Promise<EstoqueProduto>;
  update(estoque: EstoqueProduto): Promise<EstoqueProduto>;
}

/** Repositório de composições (receitas) de produtos. */
export interface IComposicaoProdutoRepository {
  findByProduto(produtoId: string): Promise<ComposicaoProduto[]>;
  save(composicao: ComposicaoProduto): Promise<ComposicaoProduto>;
  delete(id: string): Promise<void>;
}
