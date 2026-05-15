import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Associado, IAssociadoRepository, IBuscarAssociadoUseCase } from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Busca um associado pelo ID */
export class BuscarAssociadoUseCase implements IBuscarAssociadoUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  /** Executa a busca por ID, lança NotFoundException se não existir */
  async execute(id: string): Promise<Associado> {
    const associado = await this.associadoRepository.findById(id)
    if (!associado) throw new NotFoundException('Associado não encontrado')
    return associado
  }
}
