import { apiFetch } from './client'

export type StatusSafra = 'PLANEJADA' | 'EM_ANDAMENTO' | 'ENCERRADA'

export interface SafraResponse {
  id: string
  nome: string
  floradaId: string
  floradaNome?: string
  dataInicio: string
  dataFim?: string
  status: StatusSafra
  criadoEm: string
}

export interface CriarSafraInput {
  nome: string
  floradaId: string
  dataInicio: string
  dataFim?: string
}

export interface PrecoSafraResponse {
  id: string
  safraId: string
  tipoMateriaPrimaId: string
  preco: number
}

export interface DefinirPrecoInput {
  tipoMateriaPrimaId: string
  preco: number
}

export const safrasApi = {
  listar: () =>
    apiFetch<SafraResponse[]>('/producao/safras'),

  criar: (input: CriarSafraInput) =>
    apiFetch<SafraResponse>('/producao/safras', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  encerrar: (id: string) =>
    apiFetch<SafraResponse>(`/producao/safras/${id}/encerrar`, { method: 'PATCH' }),

  listarPrecos: (safraId: string) =>
    apiFetch<PrecoSafraResponse[]>(`/producao/safras/${safraId}/precos`),

  definirPreco: (safraId: string, input: DefinirPrecoInput) =>
    apiFetch<PrecoSafraResponse>(`/producao/safras/${safraId}/precos`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
