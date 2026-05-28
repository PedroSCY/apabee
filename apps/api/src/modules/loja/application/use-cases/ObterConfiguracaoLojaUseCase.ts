import { Inject, Injectable } from '@nestjs/common'
import { ConfiguracaoLoja, IConfiguracaoLojaRepository } from '@apa/core'
import { CONFIGURACAO_LOJA_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class ObterConfiguracaoLojaUseCase {
  constructor(
    @Inject(CONFIGURACAO_LOJA_REPOSITORY) private readonly configRepo: IConfiguracaoLojaRepository,
  ) {}

  async execute(): Promise<ConfiguracaoLoja> {
    return this.configRepo.obter()
  }
}
