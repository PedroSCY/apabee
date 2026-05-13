import { Inject, Injectable } from '@nestjs/common'
import { Associado, IAssociadoRepository, IBuscarAssociadoPorUsuarioUseCase } from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
export class BuscarAssociadoPorUsuarioUseCase implements IBuscarAssociadoPorUsuarioUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  async execute(usuarioId: string): Promise<Associado | null> {
    return this.associadoRepository.findByUsuarioId(usuarioId)
  }
}
