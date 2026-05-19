import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IDeletarTipoMateriaPrimaUseCase, ITipoMateriaPrimaRepository } from '@apa/core'
import { TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class DeletarTipoMateriaPrimaUseCase implements IDeletarTipoMateriaPrimaUseCase {
  constructor(
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly repository: ITipoMateriaPrimaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const tipo = await this.repository.findById(id)
    if (!tipo) throw new NotFoundException('Tipo de matéria-prima não encontrado.')
    await this.repository.delete(id)
  }
}
