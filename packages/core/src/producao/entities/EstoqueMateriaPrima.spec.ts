import { UnidadeMedida } from "@repo/shared";
import { EstoqueMateriaPrima } from "./EstoqueMateriaPrima";

const makeEstoque = (qtd = 100) =>
  new EstoqueMateriaPrima({
    id: 'uuid-1',
    tipoMateriaPrimaId: 'tipo-1',
    quantidadeDisponivel: qtd,
    unidade: UnidadeMedida.KG,
    atualizadoEm: new Date(),
  });

describe('EstoqueMateriaPrima', () => {
  it('temSaldo deve retornar true quando há quantidade suficiente', () => {
    expect(makeEstoque(100).temSaldo(50)).toBe(true);
    expect(makeEstoque(100).temSaldo(100)).toBe(true);
  });

  it('temSaldo deve retornar false quando saldo insuficiente', () => {
    expect(makeEstoque(10).temSaldo(11)).toBe(false);
  });

  it('entrada deve aumentar quantidade e preservar imutabilidade', () => {
    const estoque = makeEstoque(100);
    const atualizado = estoque.entrada(50);
    expect(atualizado.quantidadeDisponivel).toBe(150);
    expect(estoque.quantidadeDisponivel).toBe(100);
  });

  it('saida deve diminuir quantidade e preservar imutabilidade', () => {
    const estoque = makeEstoque(100);
    const atualizado = estoque.saida(30);
    expect(atualizado.quantidadeDisponivel).toBe(70);
    expect(estoque.quantidadeDisponivel).toBe(100);
  });

  it('saida com saldo insuficiente deve lançar erro', () => {
    expect(() => makeEstoque(10).saida(20)).toThrow('Saldo insuficiente em estoque.');
  });

  it('entrada com quantidade negativa deve lançar erro', () => {
    expect(() => makeEstoque(100).entrada(-1)).toThrow('Quantidade deve ser positiva.');
  });
});
