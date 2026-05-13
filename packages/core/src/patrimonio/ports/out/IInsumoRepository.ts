import { Insumo } from "../../entities/Insumo";

export interface IInsumoRepository {
  findById(id: string): Promise<Insumo | null>;
  findAll(): Promise<Insumo[]>;
  save(insumo: Insumo): Promise<Insumo>;
  update(insumo: Insumo): Promise<Insumo>;
  delete(id: string): Promise<void>;
}

