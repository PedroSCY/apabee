import { Inject, Injectable } from '@nestjs/common'
import {
  EstoqueMateriaPrima,
  IEstoqueMateriaPrimaRepository,
  IMigrarInsumosConsumiveisUseCase,
  ITipoMateriaPrimaRepository,
  MigrarInsumosInput,
} from '@apa/core'
import { randomUUID } from 'crypto'
import { ESTOQUE_MATERIA_PRIMA_REPOSITORY, TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
/** Idempotente: cria entradas de estoque com saldo zero para tipos UNIDADE que ainda não têm registro. */
export class MigrarInsumosConsumiveisUseCase implements IMigrarInsumosConsumiveisUseCase {
  constructor(
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepo: IEstoqueMateriaPrimaRepository,
  ) {}

  async execute(input: MigrarInsumosInput): Promise<{ criados: number; existentes: number }> {
    let criados = 0
    let existentes = 0

    for (const id of input.tipoMateriaPrimaIds) {
      const existente = await this.estoqueRepo.findByTipo(id)
      if (existente) {
        existentes++
        continue
      }
      const tipo = await this.tipoRepo.findById(id)
      if (!tipo) continue
      await this.estoqueRepo.save(
        new EstoqueMateriaPrima({
          id: randomUUID(),
          tipoMateriaPrimaId: id,
          quantidadeDisponivel: 0,
          unidade: tipo.unidade,
          atualizadoEm: new Date(),
        }),
      )
      criados++
    }

    return { criados, existentes }
  }
}
