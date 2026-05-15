import { Florada } from '../../entities/Florada'

export interface CriarFloradaInput {
  nome: string
  descricao?: string
}

export interface ICriarFloradaUseCase {
  execute(input: CriarFloradaInput): Promise<Florada>
}

export interface IListarFlораdasUseCase {
  execute(): Promise<Florada[]>
}
