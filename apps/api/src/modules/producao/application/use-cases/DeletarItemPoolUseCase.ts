import { Inject, Injectable } from '@nestjs/common'
import { IDeletarItemPoolUseCase, IEstoqueMateriaPrimaRepository } from '@apa/core'
import { ESTOQUE_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class DeletarItemPoolUseCase implements IDeletarItemPoolUseCase {
  constructor(
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly repository: IEstoqueMateriaPrimaRepository,
  ) {}

  async execute(tipoMateriaPrimaId: string): Promise<void> {
    await this.repository.deleteByTipo(tipoMateriaPrimaId)
  }
}
