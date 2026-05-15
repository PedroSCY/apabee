import { Colheita } from './Colheita';
import { UnidadeMedida } from '@apa/shared';

const make = (volume = 10) =>
  new Colheita({
    id: 'uuid-1', associadoId: 'assoc-1',
    tipoMateriaPrimaId: 'tipo-1',
    volume, unidade: UnidadeMedida.KG,
    dataColheita: new Date(), criadoEm: new Date(),
  });

describe('Colheita', () => {
  it('validar retorna true para volume positivo', () => {
    expect(make(10).validar()).toBe(true);
  });

  it('validar retorna false para volume zero', () => {
    expect(make(0).validar()).toBe(false);
  });

  it('validar retorna false para volume negativo', () => {
    expect(make(-1).validar()).toBe(false);
  });
});
