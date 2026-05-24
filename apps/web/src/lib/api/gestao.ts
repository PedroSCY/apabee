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
  valorMensalidade?: number
  diaVencimento?: number
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
  valorMensalidade?: number
  diaVencimento?: number
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
  participantesIds?: string[]
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
  /** Retorna a configuração atual da associação. */
  obterConfiguracao: () =>
    apiFetch<ConfiguracaoAssociacaoResponse>('/gestao/configuracoes'),
  /** Atualiza a configuração da associação. */
  atualizarConfiguracao: (input: AtualizarConfiguracaoInput) =>
    apiFetch<ConfiguracaoAssociacaoResponse>('/gestao/configuracoes', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Lista todas as atas. */
  listarAtas: () => apiFetch<AtaResponse[]>('/gestao/atas'),
  /** Cria uma nova ata. */
  criarAta: (input: CriarAtaInput) =>
    apiFetch<AtaResponse>('/gestao/atas', { method: 'POST', body: JSON.stringify(input) }),
  /** Publica uma ata (torna visível para associados). */
  publicarAta: (id: string) =>
    apiFetch<AtaResponse>(`/gestao/atas/${id}/publicar`, { method: 'PATCH' }),
  /** Despublica uma ata. */
  despublicarAta: (id: string) =>
    apiFetch<AtaResponse>(`/gestao/atas/${id}/despublicar`, { method: 'PATCH' }),
  /** Lista participantes de uma ata. */
  listarParticipantes: (ataId: string) =>
    apiFetch<ParticipanteAtaResponse[]>(`/gestao/atas/${ataId}/participantes`),
  /** Adiciona um participante a uma ata. */
  adicionarParticipante: (ataId: string, associadoId: string) =>
    apiFetch<ParticipanteAtaResponse>(`/gestao/atas/${ataId}/participantes`, {
      method: 'POST',
      body: JSON.stringify({ associadoId }),
    }),
  /** Remove um participante de uma ata. */
  removerParticipante: (ataId: string, participanteId: string) =>
    apiFetch<void>(`/gestao/atas/${ataId}/participantes/${participanteId}`, { method: 'DELETE' }),

  /** Lista documentos, opcionalmente filtrados por categoria. */
  listarDocumentos: (categoria?: string) =>
    apiFetch<DocumentoResponse[]>(`/gestao/documentos${categoria ? `?categoria=${categoria}` : ''}`),
  /** Cria um novo documento. */
  criarDocumento: (input: CriarDocumentoInput) =>
    apiFetch<DocumentoResponse>('/gestao/documentos', { method: 'POST', body: JSON.stringify(input) }),
  /** Publica um documento (torna visível para associados). */
  publicarDocumento: (id: string) =>
    apiFetch<DocumentoResponse>(`/gestao/documentos/${id}/publicar`, { method: 'PATCH' }),
  /** Despublica um documento. */
  despublicarDocumento: (id: string) =>
    apiFetch<DocumentoResponse>(`/gestao/documentos/${id}/despublicar`, { method: 'PATCH' }),
  /** Exclui um documento. */
  excluirDocumento: (id: string) =>
    apiFetch<void>(`/gestao/documentos/${id}`, { method: 'DELETE' }),
}
