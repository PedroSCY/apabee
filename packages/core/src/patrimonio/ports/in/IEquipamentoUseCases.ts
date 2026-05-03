import { Equipamento } from '../../entities/Equipamento'

export interface CriarEquipamentoInput {
  nome: string
  numeroSerie?: string
  descricao?: string
}

export interface AtualizarEquipamentoInput {
  nome?: string
  numeroSerie?: string
  descricao?: string
}

export interface ICriarEquipamentoUseCase {
  execute(input: CriarEquipamentoInput): Promise<Equipamento>
}

export interface IListarEquipamentosUseCase {
  execute(): Promise<Equipamento[]>
}

export interface IBuscarEquipamentoUseCase {
  execute(id: string): Promise<Equipamento>
}

export interface IAtualizarEquipamentoUseCase {
  execute(id: string, input: AtualizarEquipamentoInput): Promise<Equipamento>
}

export interface IColocarEquipamentoEmManutencaoUseCase {
  execute(id: string): Promise<Equipamento>
}
