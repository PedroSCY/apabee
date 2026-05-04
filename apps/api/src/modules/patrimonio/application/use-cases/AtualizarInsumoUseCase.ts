import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { AtualizarInsumoInput, IAtualizarInsumoUseCase, IInsumoRepository, Insumo } from '@apa/core'
import { INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class AtualizarInsumoUseCase implements IAtualizarInsumoUseCase {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(id: string, input: AtualizarInsumoInput): Promise<Insumo> {
    const insumo = await this.insumoRepository.findById(id)
    if (!insumo) throw new NotFoundException('Insumo não encontrado')
    const atualizado = insumo.atualizarDados(input)
    return this.insumoRepository.update(atualizado)
  }
}
