import { CategoriaAviso, DestinatariosAviso } from '@apa/shared'
import { Aviso } from '../../entities/Aviso'

/** Dados para criação de um aviso. */
export interface CriarAvisoInput {
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  fixado?: boolean
  publicado?: boolean
  destinatarios?: DestinatariosAviso
  enviarEmail?: boolean
  selectedMemberIds?: string[]
  dataReuniao?: Date
  horarioReuniao?: string
  localReuniao?: string
}

/** Caso de uso: criar um novo aviso. */
export interface ICriarAvisoUseCase {
  execute(input: CriarAvisoInput): Promise<Aviso>
}

/** Caso de uso: listar avisos. */
export interface IListarAvisosUseCase {
  execute(apenasPublicados?: boolean): Promise<Aviso[]>
}

/** Caso de uso: publicar um aviso. */
export interface IPublicarAvisoUseCase {
  execute(id: string): Promise<Aviso>
}

/** Caso de uso: despublicar um aviso. */
export interface IDespublicarAvisoUseCase {
  execute(id: string): Promise<Aviso>
}

/** Caso de uso: excluir um aviso. */
export interface IExcluirAvisoUseCase {
  execute(id: string): Promise<void>
}
