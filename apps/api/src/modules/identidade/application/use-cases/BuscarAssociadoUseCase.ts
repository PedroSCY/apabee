import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Associado, IAssociadoRepository, IBuscarAssociadoUseCase } from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
export class BuscarAssociadoUseCase implements IBuscarAssociadoUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  async execute(id: string): Promise<Associado> {
    const associado = await this.associadoRepository.findById(id)
    if (!associado) throw new NotFoundException('Associado não encontrado')
    return associado
  }
}
