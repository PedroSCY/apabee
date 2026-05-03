import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtualizarEquipamentoInput,
  Equipamento,
  IAtualizarEquipamentoUseCase,
  IEquipamentoRepository,
} from '@apa/core'
import { EQUIPAMENTO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class AtualizarEquipamentoUseCase implements IAtualizarEquipamentoUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
  ) {}

  async execute(id: string, input: AtualizarEquipamentoInput): Promise<Equipamento> {
    const equipamento = await this.equipamentoRepository.findById(id)
    if (!equipamento) throw new NotFoundException('Equipamento não encontrado')
    const atualizado = equipamento.atualizarDados(input)
    return this.equipamentoRepository.update(atualizado)
  }
}
