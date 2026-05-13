import { StatusSolicitacaoPatrimonio } from '@apa/shared'
import { SolicitacaoPatrimonio } from '../../entities/SolicitacaoPatrimonio'

/** Contrato de repositório para o agregado SolicitacaoPatrimonio. */
export interface ISolicitacaoPatrimonioRepository {
  /** Busca solicitação pelo ID. */
  findById(id: string): Promise<SolicitacaoPatrimonio | null>
  /** Lista solicitações, opcionalmente filtradas por status. */
  findAll(status?: StatusSolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio[]>
  /** Lista solicitações de um associado. */
  findByAssociado(associadoId: string): Promise<SolicitacaoPatrimonio[]>
  /** Persiste uma nova solicitação. */
  save(solicitacao: SolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio>
  /** Atualiza os dados de uma solicitação existente. */
  update(solicitacao: SolicitacaoPatrimonio): Promise<SolicitacaoPatrimonio>
}
