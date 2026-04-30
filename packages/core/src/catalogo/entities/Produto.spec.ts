import { Produto } from './Produto';

const make = (overrides = {}) =>
  new Produto({
    id: 'uuid-1', nome: 'Mel Silvestre 500g',
    slug: 'mel-silvestre-500g', descricao: 'Mel puro de florada silvestre.',
    preco: 38, ativo: true, criadoEm: new Date(), ...overrides,
  });

describe('Produto', () => {
  it('estaDisponivel retorna true quando ativo', () => {
    expect(make().estaDisponivel()).toBe(true);
  });

  it('despublicar retorna produto inativo (imutável)', () => {
    const dep = make().despublicar();
    expect(dep.ativo).toBe(false);
    expect(make().ativo).toBe(true);
  });

  it('publicar retorna produto ativo (imutável)', () => {
    const pub = make({ ativo: false }).publicar();
    expect(pub.ativo).toBe(true);
  });

  it('atualizarPreco retorna produto com novo preço (imutável)', () => {
    const atualizado = make().atualizarPreco(45);
    expect(atualizado.preco).toBe(45);
    expect(make().preco).toBe(38);
  });

  it('atualizarPreco com valor negativo lança erro', () => {
    expect(() => make().atualizarPreco(-1)).toThrow('Preço deve ser positivo.');
  });

  it('atualizarPreco com zero lança erro', () => {
    expect(() => make().atualizarPreco(0)).toThrow('Preço deve ser positivo.');
  });
});
