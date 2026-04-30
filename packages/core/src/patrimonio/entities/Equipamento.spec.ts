import { Equipamento } from './Equipamento';

const make = (emUso = false) =>
  new Equipamento({
    id: 'uuid-1', nome: 'Centrífuga',
    emUso, criadoEm: new Date(),
  });

describe('Equipamento', () => {
  it('estaDisponivel retorna true quando não está em uso', () => {
    expect(make(false).estaDisponivel()).toBe(true);
  });

  it('estaDisponivel retorna false quando em uso', () => {
    expect(make(true).estaDisponivel()).toBe(false);
  });

  it('marcarEmUso retorna novo Equipamento com emUso=true (imutável)', () => {
    const eq = make(false);
    const emUso = eq.marcarEmUso();
    expect(emUso.emUso).toBe(true);
    expect(eq.emUso).toBe(false);
  });

  it('marcarDisponivel retorna novo Equipamento com emUso=false (imutável)', () => {
    const eq = make(true);
    const disponivel = eq.marcarDisponivel();
    expect(disponivel.emUso).toBe(false);
    expect(eq.emUso).toBe(true);
  });
});
