import { Venda } from './Venda';
import { TipoVenda } from '@apa/shared';

const make = (tipo: TipoVenda, associadoId?: string) =>
  new Venda({
    id: 'uuid-1', campanhaId: 'campanha-1',
    tipo, volume: 10, valor: 500,
    data: new Date(), associadoId,
  });

describe('Venda', () => {
  it('isIndividual retorna true para INDIVIDUAL', () => {
    expect(make(TipoVenda.INDIVIDUAL, 'assoc-1').isIndividual()).toBe(true);
  });

  it('isIndividual retorna false para COLETIVA', () => {
    expect(make(TipoVenda.COLETIVA).isIndividual()).toBe(false);
  });

  it('validarIndividual lança erro sem associadoId (RN11)', () => {
    expect(() => make(TipoVenda.INDIVIDUAL).validarIndividual())
      .toThrow('Venda individual requer associadoId.');
  });

  it('validarIndividual não lança erro com associadoId', () => {
    expect(() => make(TipoVenda.INDIVIDUAL, 'assoc-1').validarIndividual())
      .not.toThrow();
  });
});
