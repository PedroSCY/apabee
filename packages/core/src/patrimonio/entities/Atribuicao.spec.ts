import { StatusAtribuicao } from "@repo/shared";
import { Atribuicao } from "./Atribuicao";

const makeAtribuicao = (overrides = {}) =>
  new Atribuicao({
    id: 'uuid-1',
    patrimonioId: 'equip-1',
    associadoId: 'assoc-1',
    dataInicio: new Date('2024-01-01'),
    status: StatusAtribuicao.ATIVO,
    ...overrides,
  });

describe('AtribuicaoEquipamento', () => {
  it('estaAtiva deve retornar true quando status é ATIVO', () => {
    expect(makeAtribuicao().estaAtiva()).toBe(true);
  });

  it('devolver deve mudar status para DEVOLVIDO e setar dataFim', () => {
    const atribuicao = makeAtribuicao();
    const devolvida = atribuicao.devolver();
    expect(devolvida.status).toBe(StatusAtribuicao.DEVOLVIDO);
    expect(devolvida.dataFim).toBeDefined();
  });

  it('devolver numa atribuição já devolvida deve lançar erro', () => {
    const devolvida = makeAtribuicao({ status: StatusAtribuicao.DEVOLVIDO });
    expect(() => devolvida.devolver()).toThrow('Atribuição já foi devolvida.');
  });

  it('deve preservar imutabilidade ao devolver', () => {
    const original = makeAtribuicao();
    original.devolver();
    expect(original.status).toBe(StatusAtribuicao.ATIVO);
  });

  it('duracaoEmDias deve calcular corretamente', () => {
    const inicio = new Date('2024-01-01');
    const fim = new Date('2024-01-11');
    const atribuicao = makeAtribuicao({ dataInicio: inicio, dataFim: fim, status: StatusAtribuicao.DEVOLVIDO });
    expect(atribuicao.duracaoEmDias()).toBe(10);
  });
});
