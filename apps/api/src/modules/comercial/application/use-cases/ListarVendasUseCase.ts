import { Inject, Injectable } from '@nestjs/common'
import { IListarVendasUseCase, IVendaRepository, Venda } from '@apa/core'
import { VENDA_REPOSITORY } from '../../comercial.tokens'

@Injectable()
export class ListarVendasUseCase implements IListarVendasUseCase {
  constructor(
    @Inject(VENDA_REPOSITORY) private readonly vendaRepo: IVendaRepository,
  ) {}

  async execute(options: { loteId?: string; associadoId?: string }): Promise<Venda[]> {
    if (options.loteId) return this.vendaRepo.findByLote(options.loteId)
    if (options.associadoId) return this.vendaRepo.findByAssociado(options.associadoId)
    return []
  }
}
