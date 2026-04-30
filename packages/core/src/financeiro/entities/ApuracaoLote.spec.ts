import { TipoMovimentoFinanceiro } from '@apa/shared'
import { ApuracaoLote } from './ApuracaoLote'
import { MovimentoFinanceiro } from './MovimentoFinanceiro'

const makeApuracao = (faturamento = 10000) =>
  new ApuracaoLote({
    id: "apur-1",
    loteProducaoId: "lote-1",
    faturamentoTotal: faturamento,
    fechadoEm: new Date(),
  });

const makeAntecipacao = (valor: number) =>
  new MovimentoFinanceiro({
    id: 'mov-1',
    associadoId: 'assoc-1',
    loteProducaoId: 'lote-1',
    valor,
    tipo: TipoMovimentoFinanceiro.ANTECIPACAO,
    data: new Date(),
  })

describe('ApuracaoLote', () => {
  it('calcularValorFinal deve aplicar RN10 corretamente', () => {
    const apuracao = makeApuracao()
    // 30% de 10000 = 3000 - 500 antecipado = 2500
    const resultado = apuracao.calcularValorFinal(30, [makeAntecipacao(500)])
    expect(resultado).toBe(2500)
  })

  it('calcularValorFinal sem antecipações deve retornar percentual puro', () => {
    const apuracao = makeApuracao()
    expect(apuracao.calcularValorFinal(25, [])).toBe(2500)
  })

   it("gerarRateio retorna MovimentoFinanceiro do tipo RATEIO_FINAL", () => {
    const rateio = makeApuracao().gerarRateio("assoc-1", 20, []);
    expect(rateio.tipo).toBe(TipoMovimentoFinanceiro.RATEIO_FINAL);
    expect(rateio.valor).toBe(2000);
  });
})
