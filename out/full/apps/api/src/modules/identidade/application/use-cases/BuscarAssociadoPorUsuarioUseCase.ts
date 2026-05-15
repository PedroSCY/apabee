import { Inject, Injectable } from '@nestjs/common'
import { Associado, IAssociadoRepository, IBuscarAssociadoPorUsuarioUseCase } from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Busca um associado pelo ID do usuário vinculado */
export class BuscarAssociadoPorUsuarioUseCase implements IBuscarAssociadoPorUsuarioUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  /** Executa a busca (retorna null se não encontrado) */
  async execute(usuarioId: string): Promise<Associado | null> {
    return this.associadoRepository.findByUsuarioId(usuarioId)
  }
}
