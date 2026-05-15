import { Equipamento } from "../../entities/Equipamento";

/** Contrato de repositório para o agregado Equipamento. */
export interface IEquipamentoRepository {
  /** Busca equipamento pelo ID. */
  findById(id: string): Promise<Equipamento | null>;
  /** Lista todos os equipamentos. */
  findAll(): Promise<Equipamento[]>;
  /** Lista equipamentos disponíveis (sem atribuição ativa). */
  findDisponiveis(): Promise<Equipamento[]>;
  /** Persiste um novo equipamento. */
  save(equipamento: Equipamento): Promise<Equipamento>;
  /** Atualiza os dados de um equipamento existente. */
  update(equipamento: Equipamento): Promise<Equipamento>;
  /** Remove um equipamento pelo ID. */
  delete(id: string): Promise<void>;
}