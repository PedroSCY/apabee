import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IIniciarSafraUseCase, ISafraRepository, Safra } from '@apa/core'
import { StatusSafra } from '@apa/shared'
import { SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class IniciarSafraUseCase implements IIniciarSafraUseCase {
  constructor(
    @Inject(SAFRA_REPOSITORY)
    private readonly repository: ISafraRepository,
  ) {}

  async execute(id: string): Promise<Safra> {
    const safra = await this.repository.findById(id)
    if (!safra) throw new NotFoundException('Safra não encontrada')
    if (safra.status !== StatusSafra.PLANEJADA)
      throw new BadRequestException('Apenas safras PLANEJADAS podem ser iniciadas')
    return this.repository.update(safra.iniciar())
  }
}
