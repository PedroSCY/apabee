import { Equipamento } from "../../entities/Equipamento";

export interface IEquipamentoRepository {
  findById(id: string): Promise<Equipamento | null>;
  findAll(): Promise<Equipamento[]>;
  findDisponiveis(): Promise<Equipamento[]>;
  save(equipamento: Equipamento): Promise<Equipamento>;
  update(equipamento: Equipamento): Promise<Equipamento>;
}