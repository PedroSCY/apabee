import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Equipamento, IEquipamentoRepository, ILiberarEquipamentoManutencaoUseCase } from '@apa/core'
import { EQUIPAMENTO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class LiberarEquipamentoManutencaoUseCase implements ILiberarEquipamentoManutencaoUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
  ) {}

  async execute(id: string): Promise<Equipamento> {
    const equipamento = await this.equipamentoRepository.findById(id)
    if (!equipamento) throw new NotFoundException('Equipamento não encontrado.')
    return this.equipamentoRepository.update(equipamento.marcarDisponivel())
  }
}
