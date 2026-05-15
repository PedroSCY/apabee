import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IEquipamentoRepository, IExcluirEquipamentoUseCase } from '@apa/core'
import { StatusPatrimonio } from '@apa/shared'
import { EQUIPAMENTO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ExcluirEquipamentoUseCase implements IExcluirEquipamentoUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const equipamento = await this.equipamentoRepository.findById(id)
    if (!equipamento) throw new NotFoundException('Equipamento não encontrado.')
    if (equipamento.status === StatusPatrimonio.EM_USO) {
      throw new BadRequestException('Equipamento em uso. Registre a devolução antes de excluir.')
    }
    await this.equipamentoRepository.delete(id)
  }
}
