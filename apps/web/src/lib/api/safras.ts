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
}

export interface CriarSafraInput {
  nome: string
  floradaId: string
  dataInicio: string
  dataFim?: string
}

export const safrasApi = {
  listar: () =>
    apiFetch<SafraResponse[]>('/producao/safras'),

  criar: (input: CriarSafraInput) =>
    apiFetch<SafraResponse>('/producao/safras', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  iniciar: (id: string) =>
    apiFetch<SafraResponse>(`/producao/safras/${id}/iniciar`, { method: 'PATCH' }),

  encerrar: (id: string) =>
    apiFetch<SafraResponse>(`/producao/safras/${id}/encerrar`, { method: 'PATCH' }),

  deletar: (id: string) =>
    apiFetch<void>(`/producao/safras/${id}`, { method: 'DELETE' }),
}
