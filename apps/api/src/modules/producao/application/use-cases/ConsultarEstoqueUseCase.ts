import { Inject, Injectable } from '@nestjs/common'
import { EstoqueMateriaPrima, IConsultarEstoqueUseCase, IEstoqueMateriaPrimaRepository } from '@apa/core'
import { ESTOQUE_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ConsultarEstoqueUseCase implements IConsultarEstoqueUseCase {
  constructor(
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly repository: IEstoqueMateriaPrimaRepository,
  ) {}

  execute(): Promise<EstoqueMateriaPrima[]> {
    return this.repository.findAll()
  }
}
