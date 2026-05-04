import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  ConfiguracaoAssociacao,
  IConfiguracaoAssociacaoRepository,
  IAtualizarConfiguracaoUseCase,
  AtualizarConfiguracaoInput,
} from '@apa/core'
import { CONFIGURACAO_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class AtualizarConfiguracaoUseCase implements IAtualizarConfiguracaoUseCase {
  constructor(
    @Inject(CONFIGURACAO_REPOSITORY)
    private readonly repository: IConfiguracaoAssociacaoRepository,
  ) {}

  async execute(input: AtualizarConfiguracaoInput): Promise<ConfiguracaoAssociacao> {
    const existente = await this.repository.findOne()

    if (!existente) {
      const nova = new ConfiguracaoAssociacao({
        id: randomUUID(),
        nomeExibido: input.nomeExibido ?? 'APA — Associação Pratense de Apicultura',
        ...input,
        atualizadoEm: new Date(),
      })
      return this.repository.save(nova)
    }

    return this.repository.update(existente.atualizar(input))
  }
}
