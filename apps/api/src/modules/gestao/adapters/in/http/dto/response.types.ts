import { CategoriaDocumento } from '@apa/shared'

// ─── Ata ─────────────────────────────────────────────────────────────────────

export interface AtaResponse {
  id: string
  titulo: string
  conteudo: string
  autorId: string
  dataReuniao: Date
  publicada: boolean
  criadoEm: Date
}

// ─── Participante Ata ─────────────────────────────────────────────────────────

export interface ParticipanteAtaResponse {
  id: string
  ataId: string
  associadoId: string
}

// ─── Documento ───────────────────────────────────────────────────────────────

export interface DocumentoResponse {
  id: string
  titulo: string
  categoria: CategoriaDocumento
  arquivoUrl: string
  tamanhoBytes: number
  publicado: boolean
  autorId: string
  criadoEm: Date
}

// ─── Configuração da Associação ───────────────────────────────────────────────

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
  atualizadoEm: Date
}
