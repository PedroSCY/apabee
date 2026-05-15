import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IBuscarInsumoUseCase, IInsumoRepository, Insumo } from '@apa/core'
import { INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class BuscarInsumoUseCase implements IBuscarInsumoUseCase {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(id: string): Promise<Insumo> {
    const insumo = await this.insumoRepository.findById(id)
    if (!insumo) throw new NotFoundException('Insumo não encontrado')
    return insumo
  }
}
