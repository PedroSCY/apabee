import { StatusCampanha } from '@apa/shared'
import { Campanha } from '../../entities/Campanha'

/** Repositório de campanhas (produção coletiva ou aquisição). */
export interface ICampanhaRepository {
  findById(id: string): Promise<Campanha | null>
  findByCodigo(codigo: string): Promise<Campanha | null>
  findAll(status?: StatusCampanha): Promise<Campanha[]>
  findVencidas(): Promise<Campanha[]>
  save(campanha: Campanha): Promise<Campanha>
  update(campanha: Campanha): Promise<Campanha>
  delete(id: string): Promise<void>
}
