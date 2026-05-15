import { apiFetch } from './client'

export interface FloradaResponse {
  id: string
  nome: string
  descricao?: string
  ativa: boolean
  criadoEm: string
}

export interface CriarFloradaInput {
  nome: string
  descricao?: string
}

export const floradasApi = {
  listar: () =>
    apiFetch<FloradaResponse[]>('/producao/floradas'),

  criar: (input: CriarFloradaInput) =>
    apiFetch<FloradaResponse>('/producao/floradas', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
