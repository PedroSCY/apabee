import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Equipamento,
  IColocarEquipamentoEmManutencaoUseCase,
  IEquipamentoRepository,
} from '@apa/core'
import { EQUIPAMENTO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ColocarEquipamentoEmManutencaoUseCase
  implements IColocarEquipamentoEmManutencaoUseCase
{
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
  ) {}

  async execute(id: string): Promise<Equipamento> {
    const equipamento = await this.equipamentoRepository.findById(id)
    if (!equipamento) throw new NotFoundException('Equipamento não encontrado')
    const emManutencao = equipamento.colocarEmManutencao()
    return this.equipamentoRepository.update(emManutencao)
  }
}
