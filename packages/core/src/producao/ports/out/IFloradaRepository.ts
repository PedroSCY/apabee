import { Florada } from '../../entities/Florada'

export interface IFloradaRepository {
  findAll(apenasAtivas?: boolean): Promise<Florada[]>
  findById(id: string): Promise<Florada | null>
  save(florada: Florada): Promise<Florada>
}
