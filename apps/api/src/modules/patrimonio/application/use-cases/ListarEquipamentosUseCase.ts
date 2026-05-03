import { Inject, Injectable } from '@nestjs/common'
import { Equipamento, IEquipamentoRepository, IListarEquipamentosUseCase } from '@apa/core'
import { EQUIPAMENTO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ListarEquipamentosUseCase implements IListarEquipamentosUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
  ) {}

  async execute(): Promise<Equipamento[]> {
    return this.equipamentoRepository.findAll()
  }
}
