import { Cota } from '../../entities/Cota'

export interface RegistrarCotaInput {
  campanhaId: string
  associadoId: string
  valor: number
}

export interface IRegistrarCotaUseCase {
  execute(input: RegistrarCotaInput): Promise<Cota>
}

export interface IConfirmarCotaUseCase {
  execute(id: string): Promise<Cota>
}

export interface IListarCotasPorCampanhaUseCase {
  execute(campanhaId: string): Promise<Cota[]>
}

export interface IMinhasCotasUseCase {
  execute(associadoId: string): Promise<Cota[]>
}

export interface ICancelarCotaUseCase {
  execute(id: string): Promise<void>
}

export interface ResumoCaptacao {
  totalArrecadado: number
  totalPago: number
  percentualDaMeta: number
  quantidadeCotas: number
  quantidadeCotasPagas: number
}

export interface IResumoCaptacaoUseCase {
  execute(campanhaId: string): Promise<ResumoCaptacao>
}
