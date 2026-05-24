import { Inject, Injectable } from '@nestjs/common'
import {
  IListarMensalidadesUseCase,
  ListarMensalidadesInput,
  IMensalidadeRepository,
  Mensalidade,
} from '@apa/core'
import { MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class ListarMensalidadesUseCase implements IListarMensalidadesUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
  ) {}

  async execute(input: ListarMensalidadesInput): Promise<Mensalidade[]> {
    if (input.competenciaAno && input.competenciaMes) {
      const todas = await this.mensalidadeRepo.findByCompetencia(input.competenciaAno, input.competenciaMes)
      return input.status ? todas.filter((m) => m.status === input.status) : todas
    }

    if (input.status) {
      return this.mensalidadeRepo.findByStatus(input.status)
    }

    return []
  }
}
