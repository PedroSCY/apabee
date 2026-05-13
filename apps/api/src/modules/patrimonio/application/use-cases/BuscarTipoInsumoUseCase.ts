import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IBuscarTipoInsumoUseCase, ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { TIPO_INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class BuscarTipoInsumoUseCase implements IBuscarTipoInsumoUseCase {
  constructor(
    @Inject(TIPO_INSUMO_REPOSITORY)
    private readonly tipoInsumoRepository: ITipoInsumoRepository,
  ) {}

  async execute(id: string): Promise<TipoInsumo> {
    const tipo = await this.tipoInsumoRepository.findById(id)
    if (!tipo) throw new NotFoundException('Tipo de insumo não encontrado.')
    return tipo
  }
}
