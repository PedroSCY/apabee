import { StatusSolicitacaoContato } from '@apa/shared'
import { SolicitacaoContato } from '../../entities/SolicitacaoContato'

/** Repositório de solicitações de contato. */
export interface ISolicitacaoContatoRepository {
  findById(id: string): Promise<SolicitacaoContato | null>
  findAll(status?: StatusSolicitacaoContato): Promise<SolicitacaoContato[]>
  save(s: SolicitacaoContato): Promise<SolicitacaoContato>
  update(s: SolicitacaoContato): Promise<SolicitacaoContato>
  delete(id: string): Promise<void>
}
