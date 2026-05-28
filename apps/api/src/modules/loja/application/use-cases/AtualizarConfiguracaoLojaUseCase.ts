import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { AtualizarConfiguracaoLojaInput, ConfiguracaoLoja, IConfiguracaoLojaRepository } from '@apa/core'
import { CONFIGURACAO_LOJA_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class AtualizarConfiguracaoLojaUseCase {
  constructor(
    @Inject(CONFIGURACAO_LOJA_REPOSITORY) private readonly configRepo: IConfiguracaoLojaRepository,
  ) {}

  async execute(input: AtualizarConfiguracaoLojaInput): Promise<ConfiguracaoLoja> {
    const atual = await this.configRepo.obter()

    const ativaEntregaPrata = input.ativaEntregaPrata ?? atual.ativaEntregaPrata
    const ativaRetiradaLocal = input.ativaRetiradaLocal ?? atual.ativaRetiradaLocal
    const ativaACombinar = input.ativaACombinar ?? atual.ativaACombinar
    const ativaCorreios = input.ativaCorreios ?? atual.ativaCorreios

    if (!ativaEntregaPrata && !ativaRetiradaLocal && !ativaACombinar && !ativaCorreios) {
      throw new BadRequestException('Pelo menos uma modalidade de entrega deve estar ativa.')
    }

    if (input.maxParcelas !== undefined && (input.maxParcelas < 1 || input.maxParcelas > 12)) {
      throw new BadRequestException('Máximo de parcelas deve ser entre 1 e 12.')
    }

    return this.configRepo.atualizar(input)
  }
}
