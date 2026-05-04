import { Inject, Injectable } from '@nestjs/common'
import { CriarInsumoInput, ICriarInsumoUseCase, IInsumoRepository, Insumo } from '@apa/core'
import { StatusPatrimonio } from '@apa/shared'
import { randomUUID } from 'crypto'
import { INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class CriarInsumoUseCase implements ICriarInsumoUseCase {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(input: CriarInsumoInput): Promise<Insumo> {
    const insumo = new Insumo({
      id: randomUUID(),
      nome: input.nome.trim(),
      categoria: input.categoria,
      descricao: input.descricao?.trim(),
      status: StatusPatrimonio.DISPONIVEL,
      criadoEm: new Date(),
    })
    return this.insumoRepository.save(insumo)
  }
}
