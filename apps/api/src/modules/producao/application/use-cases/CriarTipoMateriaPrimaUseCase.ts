import { Inject, Injectable } from '@nestjs/common'
import {
  CriarTipoMateriaPrimaInput,
  ICriarTipoMateriaPrimaUseCase,
  ITipoMateriaPrimaRepository,
  TipoMateriaPrima,
} from '@apa/core'
import { randomUUID } from 'crypto'
import { TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class CriarTipoMateriaPrimaUseCase implements ICriarTipoMateriaPrimaUseCase {
  constructor(
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly repository: ITipoMateriaPrimaRepository,
  ) {}

  async execute(input: CriarTipoMateriaPrimaInput): Promise<TipoMateriaPrima> {
    const tipo = new TipoMateriaPrima({
      id: randomUUID(),
      nome: input.nome.trim(),
      unidade: input.unidade,
      descricao: input.descricao?.trim(),
    })
    return this.repository.save(tipo)
  }
}
