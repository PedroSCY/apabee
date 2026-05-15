import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { ICampanhaRepository, IDeletarCampanhaUseCase } from '@apa/core'
import { CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class DeletarCampanhaUseCase implements IDeletarCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const campanha = await this.repository.findById(id)
    if (!campanha) throw new NotFoundException('Campanha não encontrada.')

    const statusPermitidos = ['PLANEJADA', 'CANCELADA']
    if (!statusPermitidos.includes(campanha.status)) {
      throw new BadRequestException(
        `Apenas campanhas PLANEJADAS ou CANCELADAS podem ser excluídas. Status atual: ${campanha.status}.`,
      )
    }

    await this.repository.delete(id)
  }
}
