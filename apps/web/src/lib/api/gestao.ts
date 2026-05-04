import { apiFetch } from './client'

// ── Configuração ─────────────────────────────────────────────────────────────

export interface ConfiguracaoAssociacaoResponse {
  id: string
  nomeExibido: string
  cnpj?: string
  email?: string
  telefone?: string
  endereco?: string
  corFundo?: string
  corTexto?: string
  corPrimaria?: string
  corPrimariaForeground?: string
  corSidebar?: string
  corAccent?: string
  atualizadoEm: string
}

export interface AtualizarConfiguracaoInput {
  nomeExibido?: string
  cnpj?: string
  email?: string
  telefone?: string
  endereco?: string
  corFundo?: string
  corTexto?: string
  corPrimaria?: string
  corPrimariaForeground?: string
  corSidebar?: string
  corAccent?: string
}

// ── Ata ──────────────────────────────────────────────────────────────────────

export interface AtaResponse {
  id: string
  titulo: string
  conteudo: string
  autorId: string
  dataReuniao: string
  publicada: boolean
  criadoEm: string
}

export interface ParticipanteAtaResponse {
  id: string
  ataId: string
  associadoId: string
}

export interface CriarAtaInput {
  titulo: string
  conteudo: string
  dataReuniao: string
  publicada?: boolean
}

// ── Documento ────────────────────────────────────────────────────────────────

export interface DocumentoResponse {
  id: string
  titulo: string
  categoria: string
  arquivoUrl: string
  tamanhoBytes: number
  publicado: boolean
  autorId: string
  criadoEm: string
}

export interface CriarDocumentoInput {
  titulo: string
  categoria: string
  arquivoUrl: string
  tamanhoBytes: number
  publicado?: boolean
}

// ── API object ────────────────────────────────────────────────────────────────

export const gestaoApi = {
  // Configuração
  obterConfiguracao: () =>
    apiFetch<ConfiguracaoAssociacaoResponse>('/gestao/configuracoes'),
  atualizarConfiguracao: (input: AtualizarConfiguracaoInput) =>
    apiFetch<ConfiguracaoAssociacaoResponse>('/gestao/configuracoes', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // Atas
  listarAtas: () => apiFetch<AtaResponse[]>('/gestao/atas'),
  criarAta: (input: CriarAtaInput) =>
    apiFetch<AtaResponse>('/gestao/atas', { method: 'POST', body: JSON.stringify(input) }),
  publicarAta: (id: string) =>
    apiFetch<AtaResponse>(`/gestao/atas/${id}/publicar`, { method: 'PATCH' }),
  despublicarAta: (id: string) =>
    apiFetch<AtaResponse>(`/gestao/atas/${id}/despublicar`, { method: 'PATCH' }),
  listarParticipantes: (ataId: string) =>
    apiFetch<ParticipanteAtaResponse[]>(`/gestao/atas/${ataId}/participantes`),
  adicionarParticipante: (ataId: string, associadoId: string) =>
    apiFetch<ParticipanteAtaResponse>(`/gestao/atas/${ataId}/participantes`, {
      method: 'POST',
      body: JSON.stringify({ associadoId }),
    }),
  removerParticipante: (ataId: string, participanteId: string) =>
    apiFetch<void>(`/gestao/atas/${ataId}/participantes/${participanteId}`, { method: 'DELETE' }),

  // Documentos
  listarDocumentos: (categoria?: string) =>
    apiFetch<DocumentoResponse[]>(`/gestao/documentos${categoria ? `?categoria=${categoria}` : ''}`),
  criarDocumento: (input: CriarDocumentoInput) =>
    apiFetch<DocumentoResponse>('/gestao/documentos', { method: 'POST', body: JSON.stringify(input) }),
  publicarDocumento: (id: string) =>
    apiFetch<DocumentoResponse>(`/gestao/documentos/${id}/publicar`, { method: 'PATCH' }),
  despublicarDocumento: (id: string) =>
    apiFetch<DocumentoResponse>(`/gestao/documentos/${id}/despublicar`, { method: 'PATCH' }),
  excluirDocumento: (id: string) =>
    apiFetch<void>(`/gestao/documentos/${id}`, { method: 'DELETE' }),
}
