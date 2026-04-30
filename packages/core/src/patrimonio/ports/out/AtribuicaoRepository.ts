import { Atribuicao } from "../../entities/Atribuicao";

export interface IAtribuicaoInsumoRepository {
  findById(id: string): Promise<Atribuicao | null>;
  findByAssociado(associadoId: string): Promise<Atribuicao[]>;
  findAtivaByPatrimonio(insumoId: string): Promise<Atribuicao | null>;
  save(atribuicao: Atribuicao): Promise<Atribuicao>;
  update(atribuicao: Atribuicao): Promise<Atribuicao>;
}
