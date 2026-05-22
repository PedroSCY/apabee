import { StatusSafra } from '@apa/shared'
import { Safra } from '../../entities/Safra'

export interface CriarSafraInput {
  nome: string
  floradaId: string
  dataInicio: Date
  dataFim?: Date
}

export interface AtualizarSafraInput {
  nome?: string
  dataFim?: Date
}

export interface ICriarSafraUseCase {
  execute(input: CriarSafraInput): Promise<Safra>
}

export interface IListarSafrasUseCase {
  execute(status?: StatusSafra): Promise<Safra[]>
}

export interface IBuscarSafraUseCase {
  execute(id: string): Promise<Safra>
}

export interface IAtualizarSafraUseCase {
  execute(id: string, input: AtualizarSafraInput): Promise<Safra>
}

export interface IIniciarSafraUseCase {
  execute(id: string): Promise<Safra>
}

export interface IEncerrarSafraUseCase {
  execute(id: string): Promise<Safra>
}

/** Remove permanentemente uma safra. Apenas safras PLANEJADA sem campanhas ou colheitas vinculadas podem ser excluídas. */
export interface IDeletarSafraUseCase {
  execute(id: string): Promise<void>
}
