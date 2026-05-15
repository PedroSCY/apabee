import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IColocarInsumoEmManutencaoUseCase, IInsumoRepository, Insumo } from '@apa/core'
import { StatusPatrimonio } from '@apa/shared'
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
    if (insumo.status === StatusPatrimonio.EM_USO)
      throw new BadRequestException('Insumo está em uso e não pode ser colocado em manutenção')
    if (insumo.status === StatusPatrimonio.MANUTENCAO)
      throw new BadRequestException('Insumo já está em manutenção')
    const emManutencao = insumo.colocarEmManutencao()
    return this.insumoRepository.update(emManutencao)
  }
}
