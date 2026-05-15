import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IBuscarTipoMateriaPrimaUseCase,
  ITipoMateriaPrimaRepository,
  TipoMateriaPrima,
} from '@apa/core'
import { TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class BuscarTipoMateriaPrimaUseCase implements IBuscarTipoMateriaPrimaUseCase {
  constructor(
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly repository: ITipoMateriaPrimaRepository,
  ) {}

  async execute(id: string): Promise<TipoMateriaPrima> {
    const tipo = await this.repository.findById(id)
    if (!tipo) throw new NotFoundException('Tipo de matéria-prima não encontrado')
    return tipo
  }
}
