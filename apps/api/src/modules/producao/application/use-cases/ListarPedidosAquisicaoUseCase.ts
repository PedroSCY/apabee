import { Inject, Injectable } from '@nestjs/common'
import { IPedidoAquisicaoRepository, PedidoAquisicao } from '@apa/core'
import { PEDIDO_AQUISICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarPedidosAquisicaoUseCase {
  constructor(
    @Inject(PEDIDO_AQUISICAO_REPOSITORY)
    private readonly pedidoRepo: IPedidoAquisicaoRepository,
  ) {}

  async execute(campanhaId: string, associadoId?: string): Promise<PedidoAquisicao[]> {
    if (associadoId) {
      return this.pedidoRepo.findByAssociadoECampanha(associadoId, campanhaId)
    }
    return this.pedidoRepo.findByCampanha(campanhaId)
  }
}
