import { Aviso } from '../../entities/Aviso'

export interface IAvisoRepository {
  findAll(apenasPublicados?: boolean): Promise<Aviso[]>
  findById(id: string): Promise<Aviso | null>
  save(aviso: Aviso): Promise<Aviso>
  update(aviso: Aviso): Promise<Aviso>
  delete(id: string): Promise<void>
}
