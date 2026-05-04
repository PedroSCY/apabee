import { Inject, Injectable } from '@nestjs/common'
import {
  IListarTiposMateriaPrimaUseCase,
  ITipoMateriaPrimaRepository,
  TipoMateriaPrima,
} from '@apa/core'
import { TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarTiposMateriaPrimaUseCase implements IListarTiposMateriaPrimaUseCase {
  constructor(
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly repository: ITipoMateriaPrimaRepository,
  ) {}

  execute(): Promise<TipoMateriaPrima[]> {
    return this.repository.findAll()
  }
}
