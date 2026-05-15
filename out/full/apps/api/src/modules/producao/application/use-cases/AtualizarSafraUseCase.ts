import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { AtualizarSafraInput, IAtualizarSafraUseCase, ISafraRepository, Safra } from '@apa/core'
import { SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class AtualizarSafraUseCase implements IAtualizarSafraUseCase {
  constructor(
    @Inject(SAFRA_REPOSITORY)
    private readonly repository: ISafraRepository,
  ) {}

  async execute(id: string, input: AtualizarSafraInput): Promise<Safra> {
    const safra = await this.repository.findById(id)
    if (!safra) throw new NotFoundException('Safra não encontrada')
    return this.repository.update(safra.atualizar(input))
  }
}
