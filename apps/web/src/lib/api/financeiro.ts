import { apiFetch } from './client'

export interface MovimentoFinanceiroResponse {
  id: string
  associadoId: string
  loteProducaoId: string
  valor: number
  tipo: 'ANTECIPACAO' | 'RATEIO_FINAL'
  data: string
}

export const financeiroApi = {
  /** Lista movimentos financeiros de um associado. */
  listarMovimentosPorAssociado: (associadoId: string) =>
    apiFetch<MovimentoFinanceiroResponse[]>(
      `/financeiro/movimentos/associado/${associadoId}`,
    ),
}
