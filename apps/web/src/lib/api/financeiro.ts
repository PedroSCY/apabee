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
  listarMovimentosPorAssociado: (associadoId: string) =>
    apiFetch<MovimentoFinanceiroResponse[]>(
      `/financeiro/movimentos/associado/${associadoId}`,
    ),
}
