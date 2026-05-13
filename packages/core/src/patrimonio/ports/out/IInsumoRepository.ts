import { Insumo } from "../../entities/Insumo";

/** Contrato de repositório para o agregado Insumo. */
export interface IInsumoRepository {
  /** Busca insumo pelo ID. */
  findById(id: string): Promise<Insumo | null>;
  /** Lista todos os insumos. */
  findAll(): Promise<Insumo[]>;
  /** Persiste um novo insumo. */
  save(insumo: Insumo): Promise<Insumo>;
  /** Atualiza os dados de um insumo existente. */
  update(insumo: Insumo): Promise<Insumo>;
  /** Remove um insumo pelo ID. */
  delete(id: string): Promise<void>;
}

