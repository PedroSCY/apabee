import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IColocarInsumoEmManutencaoUseCase, IInsumoRepository, Insumo } from '@apa/core'
import { INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ColocarInsumoEmManutencaoUseCase implements IColocarInsumoEmManutencaoUseCase {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(id: string): Promise<Insumo> {
    const insumo = await this.insumoRepository.findById(id)
    if (!insumo) throw new NotFoundException('Insumo não encontrado')
    const emManutencao = insumo.colocarEmManutencao()
    return this.insumoRepository.update(emManutencao)
  }
}
