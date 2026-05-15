import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IExcluirInsumoUseCase, IInsumoRepository } from '@apa/core'
import { StatusPatrimonio } from '@apa/shared'
import { INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ExcluirInsumoUseCase implements IExcluirInsumoUseCase {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const insumo = await this.insumoRepository.findById(id)
    if (!insumo) throw new NotFoundException('Insumo não encontrado.')
    if (insumo.status === StatusPatrimonio.EM_USO) {
      throw new BadRequestException('Insumo em uso. Registre a devolução antes de excluir.')
    }
    await this.insumoRepository.delete(id)
  }
}
