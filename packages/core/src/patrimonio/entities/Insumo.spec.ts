import { Insumo } from './Insumo';
import { CategoriaInsumo } from '@apa/shared';

const make = (emUso = false) =>
  new Insumo({
    id: 'uuid-1', nome: 'Cera alveolada',
    categoria: CategoriaInsumo.INSUMO,
    emUso, criadoEm: new Date(),
  });

describe('Insumo', () => {
  it('estaDisponivel retorna true quando não em uso', () => {
    expect(make(false).estaDisponivel()).toBe(true);
  });

  it('estaDisponivel retorna false quando em uso', () => {
    expect(make(true).estaDisponivel()).toBe(false);
  });

  it('marcarEmUso é imutável', () => {
    const ins = make(false);
    const emUso = ins.marcarEmUso();
    expect(emUso.emUso).toBe(true);
    expect(ins.emUso).toBe(false);
  });

  it('marcarDisponivel é imutável', () => {
    const ins = make(true);
    const disp = ins.marcarDisponivel();
    expect(disp.emUso).toBe(false);
    expect(ins.emUso).toBe(true);
  });
});
