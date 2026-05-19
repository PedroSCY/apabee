import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IDeletarColheitaUseCase, IColheitaRepository } from '@apa/core'
import { COLHEITA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class DeletarColheitaUseCase implements IDeletarColheitaUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly repository: IColheitaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const colheita = await this.repository.findById(id)
    if (!colheita) throw new NotFoundException('Colheita não encontrada.')
    await this.repository.delete(id)
  }
}
