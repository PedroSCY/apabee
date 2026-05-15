import { ComposicaoProduto } from './ComposicaoProduto';
import { UnidadeMedida } from '@apa/shared';

const make = () =>
  new ComposicaoProduto({
    id: 'uuid-1', produtoId: 'prod-1',
    tipoMateriaPrimaId: 'tipo-1',
    quantidadeNecessaria: 0.5, // 500g de mel por unidade
    unidade: UnidadeMedida.KG,
  });

describe('ComposicaoProduto', () => {
  it('verificarDisponibilidade retorna true quando estoque suficiente', () => {
    // 10kg disponível, precisa 0.5kg × 10 produtos = 5kg → ok
    expect(make().verificarDisponibilidade(10, 10)).toBe(true);
  });

  it('verificarDisponibilidade retorna false quando estoque insuficiente', () => {
    // 4kg disponível, precisa 0.5kg × 10 produtos = 5kg → insuficiente
    expect(make().verificarDisponibilidade(4, 10)).toBe(false);
  });

  it('consumoTotal calcula corretamente (RN05)', () => {
    expect(make().consumoTotal(20)).toBe(10); // 0.5 × 20 = 10kg
  });
});
