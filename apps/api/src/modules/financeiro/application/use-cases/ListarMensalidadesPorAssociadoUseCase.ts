import { Inject, Injectable } from '@nestjs/common'
import {
  IListarMensalidadesPorAssociadoUseCase,
  IMensalidadeRepository,
  Mensalidade,
} from '@apa/core'
import { MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class ListarMensalidadesPorAssociadoUseCase implements IListarMensalidadesPorAssociadoUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
  ) {}

  async execute(associadoId: string): Promise<Mensalidade[]> {
    return this.mensalidadeRepo.findByAssociado(associadoId)
  }
}
