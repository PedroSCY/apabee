import { CategoriaAviso, DestinatariosAviso, StatusSolicitacaoContato, TipoSolicitacaoContato } from '@apa/shared'

// ─── Solicitação de Contato ───────────────────────────────────────────────────

export interface SolicitacaoContatoResponse {
  id: string
  tipo: TipoSolicitacaoContato
  status: StatusSolicitacaoContato
  nome: string
  email: string
  telefone?: string
  mensagem: string
  localizacao?: string
  municipio?: string
  criadoEm: Date
}

// ─── Aviso ────────────────────────────────────────────────────────────────────

export interface AvisoResponse {
  id: string
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  publicado: boolean
  fixado: boolean
  destinatarios: DestinatariosAviso
  enviarEmail: boolean
  emailEnviado: boolean
  selectedMemberIds: string[]
  dataReuniao: Date | null
  horarioReuniao: string | null
  localReuniao: string | null
  criadoEm: Date
}
