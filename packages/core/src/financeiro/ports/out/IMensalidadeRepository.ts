import { StatusMensalidade } from '@apa/shared'
import { Mensalidade } from '../../entities/Mensalidade'

export interface IMensalidadeRepository {
  findById(id: string): Promise<Mensalidade | null>
  findByCobrancaGatewayId(gatewayId: string): Promise<Mensalidade | null>
  findByAssociado(associadoId: string): Promise<Mensalidade[]>
  findByCompetencia(ano: number, mes: number): Promise<Mensalidade[]>
  findByAssociadoECompetencia(associadoId: string, ano: number, mes: number): Promise<Mensalidade | null>
  findByStatus(status: StatusMensalidade): Promise<Mensalidade[]>
  countPendentesByAssociado(associadoId: string): Promise<number>
  save(mensalidade: Mensalidade): Promise<Mensalidade>
  saveMany(mensalidades: Mensalidade[]): Promise<Mensalidade[]>
  update(mensalidade: Mensalidade): Promise<Mensalidade>
  delete(id: string): Promise<void>
}
