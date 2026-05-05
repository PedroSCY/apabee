import { CategoriaAviso } from '@apa/shared'
import { Aviso } from '../../entities/Aviso'

export interface CriarAvisoInput {
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  fixado?: boolean
  publicado?: boolean
}

export interface ICriarAvisoUseCase {
  execute(input: CriarAvisoInput): Promise<Aviso>
}

export interface IListarAvisosUseCase {
  execute(apenasPublicados?: boolean): Promise<Aviso[]>
}

export interface IPublicarAvisoUseCase {
  execute(id: string): Promise<Aviso>
}

export interface IDespublicarAvisoUseCase {
  execute(id: string): Promise<Aviso>
}

export interface IExcluirAvisoUseCase {
  execute(id: string): Promise<void>
}
