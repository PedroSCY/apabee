import { EstoqueProduto } from './EstoqueProduto';

const make = (qtd = 100) =>
  new EstoqueProduto({
    id: 'uuid-1', produtoId: 'prod-1',
    quantidadeDisponivel: qtd, atualizadoEm: new Date(),
  });

describe('EstoqueProduto', () => {
  it('temSaldo retorna true quando há quantidade suficiente', () => {
    expect(make(100).temSaldo(50)).toBe(true);
    expect(make(100).temSaldo(100)).toBe(true);
  });

  it('temSaldo retorna false quando saldo insuficiente', () => {
    expect(make(10).temSaldo(11)).toBe(false);
  });

  it('entrada aumenta saldo (imutável)', () => {
    const est = make(100);
    const novo = est.entrada(50);
    expect(novo.quantidadeDisponivel).toBe(150);
    expect(est.quantidadeDisponivel).toBe(100);
  });

  it('saida diminui saldo (imutável) — RN04', () => {
    const est = make(100);
    const novo = est.saida(30);
    expect(novo.quantidadeDisponivel).toBe(70);
    expect(est.quantidadeDisponivel).toBe(100);
  });

  it('saida com saldo insuficiente lança erro (RN04)', () => {
    expect(() => make(10).saida(20))
      .toThrow('Saldo insuficiente no estoque de produto.');
  });

  it('entrada com quantidade negativa lança erro', () => {
    expect(() => make(100).entrada(-1))
      .toThrow('Quantidade deve ser positiva.');
  });
});
