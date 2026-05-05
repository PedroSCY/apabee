import { apiFetch } from './client'

export interface AvisoResponse {
  id: string
  titulo: string
  conteudo: string
  categoria: 'GERAL' | 'URGENTE' | 'REUNIAO' | 'FINANCEIRO'
  publicado: boolean
  fixado: boolean
  criadoEm: string
}

export interface CriarAvisoInput {
  titulo: string
  conteudo: string
  categoria: string
  fixado?: boolean
  publicado?: boolean
}

export const comunicacaoApi = {
  listarAvisos: (apenasPublicados = false) =>
    apiFetch<AvisoResponse[]>(
      `/comunicacao/avisos${apenasPublicados ? '?publicos=true' : ''}`,
    ),

  criarAviso: (input: CriarAvisoInput) =>
    apiFetch<AvisoResponse>('/comunicacao/avisos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  publicarAviso: (id: string) =>
    apiFetch<AvisoResponse>(`/comunicacao/avisos/${id}/publicar`, { method: 'PATCH' }),

  despublicarAviso: (id: string) =>
    apiFetch<AvisoResponse>(`/comunicacao/avisos/${id}/despublicar`, { method: 'PATCH' }),

  excluirAviso: (id: string) =>
    apiFetch<void>(`/comunicacao/avisos/${id}`, { method: 'DELETE' }),
}
