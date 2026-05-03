import { Inject, Injectable } from '@nestjs/common'
import {
  CriarEquipamentoInput,
  Equipamento,
  ICriarEquipamentoUseCase,
  IEquipamentoRepository,
} from '@apa/core'
import { StatusPatrimonio } from '@apa/shared'
import { randomUUID } from 'crypto'
import { EQUIPAMENTO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class CriarEquipamentoUseCase implements ICriarEquipamentoUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
  ) {}

  async execute(input: CriarEquipamentoInput): Promise<Equipamento> {
    const equipamento = new Equipamento({
      id: randomUUID(),
      nome: input.nome.trim(),
      numeroSerie: input.numeroSerie?.trim(),
      descricao: input.descricao?.trim(),
      status: StatusPatrimonio.DISPONIVEL,
      criadoEm: new Date(),
    })
    return this.equipamentoRepository.save(equipamento)
  }
}
