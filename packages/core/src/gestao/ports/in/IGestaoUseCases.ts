import type { Ata } from '../../entities/Ata'
import type { Documento } from '../../entities/Documento'
import type { ParticipanteAta } from '../../entities/ParticipanteAta'
import type { ConfiguracaoAssociacao } from '../../entities/ConfiguracaoAssociacao'
import type { CategoriaDocumento } from '@apa/shared'

// ── Ata ──────────────────────────────────────────────────────────────────────

export interface CriarAtaInput {
  titulo: string
  conteudo: string
  autorId: string
  dataReuniao: Date
  publicada?: boolean
}

export interface ICriarAtaUseCase {
  execute(input: CriarAtaInput): Promise<Ata>
}

export interface IListarAtasUseCase {
  execute(apenasPublicadas?: boolean): Promise<Ata[]>
}

export interface IPublicarAtaUseCase {
  execute(id: string): Promise<Ata>
}

export interface IDespublicarAtaUseCase {
  execute(id: string): Promise<Ata>
}

export interface IAdicionarParticipanteUseCase {
  execute(ataId: string, associadoId: string): Promise<ParticipanteAta>
}

export interface IRemoverParticipanteUseCase {
  execute(participanteId: string): Promise<void>
}

export interface IListarParticipantesAtaUseCase {
  execute(ataId: string): Promise<ParticipanteAta[]>
}

// ── Documento ────────────────────────────────────────────────────────────────

export interface CriarDocumentoInput {
  titulo: string
  categoria: CategoriaDocumento
  arquivoUrl: string
  tamanhoBytes: number
  autorId: string
  publicado?: boolean
}

export interface ICriarDocumentoUseCase {
  execute(input: CriarDocumentoInput): Promise<Documento>
}

export interface IListarDocumentosUseCase {
  execute(categoria?: CategoriaDocumento, apenasPublicados?: boolean): Promise<Documento[]>
}

export interface IPublicarDocumentoUseCase {
  execute(id: string): Promise<Documento>
}

export interface IDespublicarDocumentoUseCase {
  execute(id: string): Promise<Documento>
}

export interface IExcluirDocumentoUseCase {
  execute(id: string): Promise<void>
}

// ── ConfiguracaoAssociacao ────────────────────────────────────────────────────

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

export interface IObterConfiguracaoUseCase {
  execute(): Promise<ConfiguracaoAssociacao>
}

export interface IAtualizarConfiguracaoUseCase {
  execute(input: AtualizarConfiguracaoInput): Promise<ConfiguracaoAssociacao>
}
