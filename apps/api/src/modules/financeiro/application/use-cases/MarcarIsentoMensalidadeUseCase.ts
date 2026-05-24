import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IMarcarIsentoMensalidadeUseCase,
  MarcarIsentoMensalidadeInput,
  IMensalidadeRepository,
  Mensalidade,
} from '@apa/core'
import { MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class MarcarIsentoMensalidadeUseCase implements IMarcarIsentoMensalidadeUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
  ) {}

  async execute(input: MarcarIsentoMensalidadeInput): Promise<Mensalidade> {
    const mensalidade = await this.mensalidadeRepo.findById(input.mensalidadeId)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')

    return this.mensalidadeRepo.update(mensalidade.isentar(input.motivo))
  }
}
