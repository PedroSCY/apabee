import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IEncerrarSafraUseCase, ISafraRepository, Safra } from '@apa/core'
import { StatusSafra } from '@apa/shared'
import { SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class EncerrarSafraUseCase implements IEncerrarSafraUseCase {
  constructor(
    @Inject(SAFRA_REPOSITORY)
    private readonly repository: ISafraRepository,
  ) {}

  async execute(id: string): Promise<Safra> {
    const safra = await this.repository.findById(id)
    if (!safra) throw new NotFoundException('Safra não encontrada')
    if (safra.status !== StatusSafra.EM_ANDAMENTO)
      throw new BadRequestException('Apenas safras EM_ANDAMENTO podem ser encerradas')
    return this.repository.update(safra.encerrar())
  }
}
