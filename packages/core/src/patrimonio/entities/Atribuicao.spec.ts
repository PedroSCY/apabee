import { AtribuicaoPatrimonio } from './AtribuicaoPatrimonio';
import { StatusAtribuicao, TipoPatrimonio } from '@apa/shared';

const make = (tipo = TipoPatrimonio.EQUIPAMENTO, overrides = {}) =>
  new AtribuicaoPatrimonio({
    id: 'uuid-1', patrimonioId: 'pat-1',
    tipoPatrimonio: tipo, associadoId: 'assoc-1',
    dataInicio: new Date('2024-01-01'),
    status: StatusAtribuicao.ATIVO, ...overrides,
  });

describe('AtribuicaoPatrimonio', () => {
  it('estaAtiva retorna true quando ATIVO', () => {
    expect(make().estaAtiva()).toBe(true);
  });

  it('isEquipamento e isInsumo discriminam corretamente', () => {
    expect(make(TipoPatrimonio.EQUIPAMENTO).isEquipamento()).toBe(true);
    expect(make(TipoPatrimonio.EQUIPAMENTO).isInsumo()).toBe(false);
    expect(make(TipoPatrimonio.INSUMO).isInsumo()).toBe(true);
    expect(make(TipoPatrimonio.INSUMO).isEquipamento()).toBe(false);
  });

  it('devolver muda status para DEVOLVIDO e seta dataFim', () => {
    const devolvida = make().devolver();
    expect(devolvida.status).toBe(StatusAtribuicao.DEVOLVIDO);
    expect(devolvida.dataFim).toBeDefined();
  });

  it('devolver atribuição já devolvida lança erro', () => {
    expect(() => make(TipoPatrimonio.EQUIPAMENTO, { status: StatusAtribuicao.DEVOLVIDO }).devolver())
      .toThrow('Atribuição já foi devolvida.');
  });

  it('preserva imutabilidade ao devolver', () => {
    const original = make();
    original.devolver();
    expect(original.status).toBe(StatusAtribuicao.ATIVO);
  });

  it('duracaoEmDias calcula corretamente', () => {
    const a = make(TipoPatrimonio.EQUIPAMENTO, {
      dataInicio: new Date('2024-01-01'),
      dataFim: new Date('2024-01-11'),
      status: StatusAtribuicao.DEVOLVIDO,
    });
    expect(a.duracaoEmDias()).toBe(10);
  });
});
