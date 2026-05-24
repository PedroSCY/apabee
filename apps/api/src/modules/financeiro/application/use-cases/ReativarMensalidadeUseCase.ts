import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IReativarMensalidadeUseCase,
  IMensalidadeRepository,
  Mensalidade,
} from '@apa/core'
import { MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class ReativarMensalidadeUseCase implements IReativarMensalidadeUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
  ) {}

  async execute(mensalidadeId: string): Promise<Mensalidade> {
    const mensalidade = await this.mensalidadeRepo.findById(mensalidadeId)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')

    return this.mensalidadeRepo.update(mensalidade.reativar())
  }
}
