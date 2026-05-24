import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Associado, IAssociadoRepository, IMarcarIsentoAssociadoUseCase } from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
export class MarcarIsentoAssociadoUseCase implements IMarcarIsentoAssociadoUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  async execute(associadoId: string): Promise<Associado> {
    const associado = await this.associadoRepository.findById(associadoId)
    if (!associado) throw new NotFoundException('Associado não encontrado.')
    return this.associadoRepository.update(associado.marcarIsento())
  }
}
