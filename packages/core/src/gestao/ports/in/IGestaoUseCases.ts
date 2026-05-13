import type { Ata } from '../../entities/Ata'
import type { Documento } from '../../entities/Documento'
import type { ParticipanteAta } from '../../entities/ParticipanteAta'
import type { ConfiguracaoAssociacao } from '../../entities/ConfiguracaoAssociacao'
import type { CategoriaDocumento } from '@apa/shared'

// ── Ata ──────────────────────────────────────────────────────────────────────

/** Dados para criação de uma ata. */
export interface CriarAtaInput {
  titulo: string
  conteudo: string
  autorId: string
  dataReuniao: Date
  publicada?: boolean
  participantesIds?: string[]
}

/** Caso de uso: criar uma nova ata. */
export interface ICriarAtaUseCase {
  execute(input: CriarAtaInput): Promise<Ata>
}

/** Caso de uso: listar atas. */
export interface IListarAtasUseCase {
  execute(apenasPublicadas?: boolean): Promise<Ata[]>
}

/** Caso de uso: publicar uma ata. */
export interface IPublicarAtaUseCase {
  execute(id: string): Promise<Ata>
}

/** Caso de uso: despublicar uma ata. */
export interface IDespublicarAtaUseCase {
  execute(id: string): Promise<Ata>
}

/** Caso de uso: adicionar participante a uma ata. */
export interface IAdicionarParticipanteUseCase {
  execute(ataId: string, associadoId: string): Promise<ParticipanteAta>
}

/** Caso de uso: remover participante de uma ata. */
export interface IRemoverParticipanteUseCase {
  execute(participanteId: string): Promise<void>
}

/** Caso de uso: listar participantes de uma ata. */
export interface IListarParticipantesAtaUseCase {
  execute(ataId: string): Promise<ParticipanteAta[]>
}

// ── Documento ────────────────────────────────────────────────────────────────

/** Dados para criação de um documento. */
export interface CriarDocumentoInput {
  titulo: string
  categoria: CategoriaDocumento
  arquivoUrl: string
  tamanhoBytes: number
  autorId: string
  publicado?: boolean
}

/** Caso de uso: criar um novo documento. */
export interface ICriarDocumentoUseCase {
  execute(input: CriarDocumentoInput): Promise<Documento>
}

/** Caso de uso: listar documentos. */
export interface IListarDocumentosUseCase {
  execute(categoria?: CategoriaDocumento, apenasPublicados?: boolean): Promise<Documento[]>
}

/** Caso de uso: publicar um documento. */
export interface IPublicarDocumentoUseCase {
  execute(id: string): Promise<Documento>
}

/** Caso de uso: despublicar um documento. */
export interface IDespublicarDocumentoUseCase {
  execute(id: string): Promise<Documento>
}

/** Caso de uso: excluir um documento. */
export interface IExcluirDocumentoUseCase {
  execute(id: string): Promise<void>
}

// ── ConfiguracaoAssociacao ────────────────────────────────────────────────────

/** Dados para atualização da configuração da associação. */
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

/** Caso de uso: obter configuração da associação. */
export interface IObterConfiguracaoUseCase {
  execute(): Promise<ConfiguracaoAssociacao>
}

/** Caso de uso: atualizar configuração da associação. */
export interface IAtualizarConfiguracaoUseCase {
  execute(input: AtualizarConfiguracaoInput): Promise<ConfiguracaoAssociacao>
}
