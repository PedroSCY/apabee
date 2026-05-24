import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Associado, IAssociadoRepository, IRemoverIsencaoAssociadoUseCase } from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
export class RemoverIsencaoAssociadoUseCase implements IRemoverIsencaoAssociadoUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  async execute(associadoId: string): Promise<Associado> {
    const associado = await this.associadoRepository.findById(associadoId)
    if (!associado) throw new NotFoundException('Associado não encontrado.')
    return this.associadoRepository.update(associado.removerIsencao())
  }
}
