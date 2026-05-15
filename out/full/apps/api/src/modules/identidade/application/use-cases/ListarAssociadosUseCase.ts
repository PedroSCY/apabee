import { Inject, Injectable } from '@nestjs/common'
import { Associado, IAssociadoRepository, IListarAssociadosUseCase } from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Lista todos os associados cadastrados */
export class ListarAssociadosUseCase implements IListarAssociadosUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  /** Retorna todos os associados */
  async execute(): Promise<Associado[]> {
    return this.associadoRepository.findAll()
  }
}
