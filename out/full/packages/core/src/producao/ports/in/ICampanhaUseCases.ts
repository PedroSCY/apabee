import { StatusCampanha, TipoLote } from '@apa/shared'
import { Campanha } from '../../entities/Campanha'

export interface CriarCampanhaInput {
  nome: string
  tipo: TipoLote
  safraId?: string
  dataInicio: Date
  dataFim?: Date
  // apenas AQUISICAO
  valorMeta?: number
  prazoContribuicao?: Date
  valorMinimo?: number
  valorMaximo?: number
}

export interface ICriarCampanhaUseCase {
  execute(input: CriarCampanhaInput): Promise<Campanha>
}

export interface IListarCampanhasUseCase {
  execute(status?: StatusCampanha): Promise<Campanha[]>
}

export interface IBuscarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface IIniciarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface IConcluirCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface ILiquidarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

export interface ICancelarCampanhaUseCase {
  execute(id: string): Promise<Campanha>
}

/** Remove permanentemente uma campanha. Apenas PLANEJADA ou CANCELADA podem ser deletadas. */
export interface IDeletarCampanhaUseCase {
  execute(id: string): Promise<void>
}
