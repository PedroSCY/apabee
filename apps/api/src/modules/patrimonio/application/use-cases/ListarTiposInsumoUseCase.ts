import { Inject, Injectable } from '@nestjs/common'
import { IListarTiposInsumoUseCase, ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { TIPO_INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ListarTiposInsumoUseCase implements IListarTiposInsumoUseCase {
  constructor(
    @Inject(TIPO_INSUMO_REPOSITORY)
    private readonly tipoInsumoRepository: ITipoInsumoRepository,
  ) {}

  async execute(): Promise<TipoInsumo[]> {
    return this.tipoInsumoRepository.findAll()
  }
}
