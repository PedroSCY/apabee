import { Venda } from '../../entities/Venda';

/** Repositório de vendas. */
export interface IVendaRepository {
  findById(id: string): Promise<Venda | null>;
  findByCampanha(campanhaId: string): Promise<Venda[]>;
  findByAssociado(associadoId: string): Promise<Venda[]>;
  save(venda: Venda): Promise<Venda>;
}
