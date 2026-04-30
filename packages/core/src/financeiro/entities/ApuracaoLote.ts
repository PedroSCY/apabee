import { TipoMovimentoFinanceiro } from '@repo/shared';
import { MovimentoFinanceiro } from './MovimentoFinanceiro';


interface ApuracaoLoteProps {
  id: string;
  loteProducaoId: string;
  faturamentoTotal: number;
  fechadoEm: Date;
}

export class ApuracaoLote {
  private readonly props: ApuracaoLoteProps;

  constructor(props: ApuracaoLoteProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get loteProducaoId(): string { return this.props.loteProducaoId; }
  get faturamentoTotal(): number { return this.props.faturamentoTotal; }
  get fechadoEm(): Date { return this.props.fechadoEm; }

  // RN10: valor_final = (percentual * faturamentoTotal) - antecipacoes
  calcularValorFinal(percentual: number, antecipacoes: MovimentoFinanceiro[]): number {
    const direito = (percentual / 100) * this.props.faturamentoTotal;
    const totalAntecipado = antecipacoes
      .filter(m => m.isAntecipacao())
      .reduce((sum, m) => sum + m.valor, 0);
    return direito - totalAntecipado;
  }

  gerarRateio(associadoId: string, percentual: number, antecipacoes: MovimentoFinanceiro[]): MovimentoFinanceiro {
    const valorFinal = this.calcularValorFinal(percentual, antecipacoes);
    return new MovimentoFinanceiro({
      id: crypto.randomUUID(),
      associadoId,
      loteProducaoId: this.props.loteProducaoId,
      valor: valorFinal,
      tipo: TipoMovimentoFinanceiro.RATEIO_FINAL,
      data: new Date(),
    });
  }
}
