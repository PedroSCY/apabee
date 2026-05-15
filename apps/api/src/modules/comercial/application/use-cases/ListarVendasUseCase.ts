import { Inject, Injectable } from '@nestjs/common'
import { IListarVendasUseCase, IVendaRepository, Venda } from '@apa/core'
import { VENDA_REPOSITORY } from '../../comercial.tokens'

@Injectable()
export class ListarVendasUseCase implements IListarVendasUseCase {
  constructor(
    @Inject(VENDA_REPOSITORY) private readonly vendaRepo: IVendaRepository,
  ) {}

  async execute(options: { campanhaId?: string; associadoId?: string }): Promise<Venda[]> {
    if (options.campanhaId) return this.vendaRepo.findByCampanha(options.campanhaId)
    if (options.associadoId) return this.vendaRepo.findByAssociado(options.associadoId)
    return []
  }
}
