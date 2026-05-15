import { Equipamento } from '../../entities/Equipamento'

/** Dados necessários para criar um novo equipamento. */
export interface CriarEquipamentoInput {
  nome: string
  numeroSerie?: string
  descricao?: string
}

/** Dados para atualização parcial de um equipamento. */
export interface AtualizarEquipamentoInput {
  nome?: string
  numeroSerie?: string
  descricao?: string
}

/** Caso de uso para criação de equipamento. */
export interface ICriarEquipamentoUseCase {
  execute(input: CriarEquipamentoInput): Promise<Equipamento>
}

/** Caso de uso para listagem de equipamentos. */
export interface IListarEquipamentosUseCase {
  execute(): Promise<Equipamento[]>
}

/** Caso de uso para busca de equipamento por ID. */
export interface IBuscarEquipamentoUseCase {
  execute(id: string): Promise<Equipamento>
}

/** Caso de uso para atualização de equipamento. */
export interface IAtualizarEquipamentoUseCase {
  execute(id: string, input: AtualizarEquipamentoInput): Promise<Equipamento>
}

/** Caso de uso para colocar equipamento em manutenção. */
export interface IColocarEquipamentoEmManutencaoUseCase {
  execute(id: string): Promise<Equipamento>
}

/** Caso de uso para exclusão de equipamento. */
export interface IExcluirEquipamentoUseCase {
  execute(id: string): Promise<void>
}

/** Caso de uso para liberar equipamento da manutenção. */
export interface ILiberarEquipamentoManutencaoUseCase {
  execute(id: string): Promise<Equipamento>
}
