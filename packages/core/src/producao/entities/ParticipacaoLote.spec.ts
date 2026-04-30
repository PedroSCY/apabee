import { ParticipacaoLote } from './ParticipacaoLote';

const make = (percentual: number) =>
  new ParticipacaoLote({
    id: 'uuid-1', loteProducaoId: 'lote-1',
    associadoId: 'assoc-1', percentual,
  });

describe('ParticipacaoLote', () => {
  it('calcularDireito aplica percentual sobre faturamento', () => {
    expect(make(30).calcularDireito(10000)).toBe(3000);
  });

  it('calcularDireito com 100% retorna faturamento total', () => {
    expect(make(100).calcularDireito(5000)).toBe(5000);
  });

  it('calcularDireito com 0% retorna zero', () => {
    expect(make(0).calcularDireito(10000)).toBe(0);
  });
});
