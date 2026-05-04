import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ConfiguracaoAssociacao, IConfiguracaoAssociacaoRepository, IObterConfiguracaoUseCase } from '@apa/core'
import { CONFIGURACAO_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class ObterConfiguracaoUseCase implements IObterConfiguracaoUseCase {
  constructor(
    @Inject(CONFIGURACAO_REPOSITORY)
    private readonly repository: IConfiguracaoAssociacaoRepository,
  ) {}

  async execute(): Promise<ConfiguracaoAssociacao> {
    const config = await this.repository.findOne()
    if (config) return config

    // Inicializa o singleton com valores padrão caso não exista
    const nova = new ConfiguracaoAssociacao({
      id: randomUUID(),
      nomeExibido: 'APA — Associação Pratense de Apicultura',
      atualizadoEm: new Date(),
    })
    return this.repository.save(nova)
  }
}
