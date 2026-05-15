import { StatusProduto } from '@apa/shared'
import { Produto } from './Produto'

const make = (overrides = {}) =>
  new Produto({
    id: 'uuid-1',
    nome: 'Mel Silvestre 500g',
    slug: 'mel-silvestre-500g',
    descricao: 'Mel puro de florada silvestre.',
    preco: 38,
    status: StatusProduto.PUBLICADO,
    criadoEm: new Date(),
    ...overrides,
  })

describe('Produto', () => {
  it('estaDisponivel retorna true quando PUBLICADO', () => {
    expect(make().estaDisponivel()).toBe(true)
  })

  it('estaDisponivel retorna false quando RASCUNHO', () => {
    expect(make({ status: StatusProduto.RASCUNHO }).estaDisponivel()).toBe(false)
  })

  it('estaDisponivel retorna false quando ARQUIVADO', () => {
    expect(make({ status: StatusProduto.ARQUIVADO }).estaDisponivel()).toBe(false)
  })

  it('despublicar retorna produto RASCUNHO (imutável)', () => {
    const dep = make().despublicar()
    expect(dep.status).toBe(StatusProduto.RASCUNHO)
    expect(make().status).toBe(StatusProduto.PUBLICADO)
  })

  it('publicar retorna produto PUBLICADO (imutável)', () => {
    const pub = make({ status: StatusProduto.RASCUNHO }).publicar()
    expect(pub.status).toBe(StatusProduto.PUBLICADO)
  })

  it('arquivar retorna produto ARQUIVADO (imutável)', () => {
    const arq = make().arquivar()
    expect(arq.status).toBe(StatusProduto.ARQUIVADO)
    expect(make().status).toBe(StatusProduto.PUBLICADO)
  })

  it('atualizarPreco retorna produto com novo preço (imutável)', () => {
    const atualizado = make().atualizarPreco(45)
    expect(atualizado.preco).toBe(45)
    expect(make().preco).toBe(38)
  })

  it('atualizarPreco com valor negativo lança erro', () => {
    expect(() => make().atualizarPreco(-1)).toThrow('Preço deve ser positivo.')
  })

  it('atualizarPreco com zero lança erro', () => {
    expect(() => make().atualizarPreco(0)).toThrow('Preço deve ser positivo.')
  })
})
