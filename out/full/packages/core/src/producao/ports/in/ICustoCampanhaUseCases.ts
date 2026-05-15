import { CategoriaCusto } from '@apa/shared'
import { CustoCampanha } from '../../entities/CustoCampanha'

export interface RegistrarCustoInput {
  campanhaId: string
  descricao: string
  valor: number
  categoria: CategoriaCusto
  pagoPorId?: string
  comprovanteUrl?: string
}

export interface IRegistrarCustoUseCase {
  execute(input: RegistrarCustoInput): Promise<CustoCampanha>
}

export interface IListarCustosPorCampanhaUseCase {
  execute(campanhaId: string): Promise<CustoCampanha[]>
}

export interface IRemoverCustoUseCase {
  execute(id: string): Promise<void>
}
