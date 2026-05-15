import { Ata } from './Ata';

const make = (overrides = {}) =>
  new Ata({
    id: 'uuid-1', titulo: 'Reunião Abril',
    conteudo: 'Pauta: rateio de abril.',
    autorId: 'user-1', dataReuniao: new Date('2024-04-01'),
    publicada: false, criadoEm: new Date(), ...overrides,
  });

describe('Ata', () => {
  it('publicar retorna ata com publicada=true', () => {
    const pub = make().publicar();
    expect(pub.publicada).toBe(true);
    expect(make().publicada).toBe(false); // imutabilidade
  });

  it('despublicar retorna ata com publicada=false', () => {
    const dep = make({ publicada: true }).despublicar();
    expect(dep.publicada).toBe(false);
  });
});
