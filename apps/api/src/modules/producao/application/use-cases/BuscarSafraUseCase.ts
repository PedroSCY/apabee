import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IBuscarSafraUseCase, ISafraRepository, Safra } from '@apa/core'
import { SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class BuscarSafraUseCase implements IBuscarSafraUseCase {
  constructor(
    @Inject(SAFRA_REPOSITORY)
    private readonly repository: ISafraRepository,
  ) {}

  async execute(id: string): Promise<Safra> {
    const safra = await this.repository.findById(id)
    if (!safra) throw new NotFoundException('Safra não encontrada')
    return safra
  }
}
