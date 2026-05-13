import { StatusSolicitacaoPatrimonio } from '@apa/shared'
import { SolicitacaoPatrimonio } from '../../entities/SolicitacaoPatrimonio'

export interface ISolicitacaoPatrimonioRepository {
  findById(id: string): Promise<SolicitacaoPatrimonio | null>
  findAll(status?: StatusSolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio[]>
  findByAssociado(associadoId: string): Promise<SolicitacaoPatrimonio[]>
  save(solicitacao: SolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio>
  update(solicitacao: SolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio>
}
