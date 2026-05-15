import { Documento } from './Documento';
import { CategoriaDocumento } from '@apa/shared';

const make = (overrides = {}) =>
  new Documento({
    id: 'uuid-1', titulo: 'Ata Abril/2024',
    categoria: CategoriaDocumento.ATA,
    arquivoUrl: 'https://storage/ata.pdf',
    tamanhoBytes: 2_097_152, // 2MB
    publicado: false, autorId: 'user-1',
    criadoEm: new Date(), ...overrides,
  });

describe('Documento', () => {
  it('publicar retorna documento com publicado=true', () => {
    const pub = make().publicar();
    expect(pub.publicado).toBe(true);
    expect(make().publicado).toBe(false); // imutabilidade
  });

  it('despublicar retorna documento com publicado=false', () => {
    const doc = make({ publicado: true }).despublicar();
    expect(doc.publicado).toBe(false);
  });

  it('tamanhoEmMB converte corretamente', () => {
    expect(make().tamanhoEmMB()).toBe(2);
  });
});
