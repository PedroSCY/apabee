import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IExcluirMensalidadeUseCase, IMensalidadeRepository } from '@apa/core'
import { MENSALIDADE_REPOSITORY } from '../../financeiro.tokens'

@Injectable()
export class ExcluirMensalidadeUseCase implements IExcluirMensalidadeUseCase {
  constructor(
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
  ) {}

  async execute(mensalidadeId: string): Promise<void> {
    const mensalidade = await this.mensalidadeRepo.findById(mensalidadeId)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')

    if (!mensalidade.isPendente()) {
      throw new BadRequestException(
        `Apenas mensalidades PENDENTES podem ser excluídas. Status atual: ${mensalidade.status}`,
      )
    }

    if (mensalidade.temCobrancaAtiva()) {
      throw new BadRequestException(
        'Cancele a cobrança PIX antes de excluir a mensalidade.',
      )
    }

    await this.mensalidadeRepo.delete(mensalidadeId)
  }
}
