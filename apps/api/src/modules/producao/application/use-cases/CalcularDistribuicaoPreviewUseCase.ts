import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ICalcularDistribuicaoPreviewUseCase,
  ICampanhaRepository,
  ICotaRepository,
  IItemAquisicaoRepository,
  PreviewDistribuicao,
} from '@apa/core'
import { CAMPANHA_REPOSITORY, COTA_REPOSITORY, ITEM_AQUISICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
/** Simula a distribuição dos itens de uma campanha de AQUISIÇÃO sem executar — usado para preview do admin. */
export class CalcularDistribuicaoPreviewUseCase implements ICalcularDistribuicaoPreviewUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(COTA_REPOSITORY)
    private readonly cotaRepo: ICotaRepository,
    @Inject(ITEM_AQUISICAO_REPOSITORY)
    private readonly itemRepo: IItemAquisicaoRepository,
  ) {}

  async execute(campanhaId: string): Promise<PreviewDistribuicao> {
    const campanha = await this.campanhaRepo.findById(campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')

    const cotas = await this.cotaRepo.findByCampanha(campanhaId)
    const cotasPagas = cotas.filter(c => c.pago)
    const totalArrecadado = cotasPagas.reduce((s, c) => s + c.valor, 0)

    const itens = await this.itemRepo.findByCampanha(campanhaId)

    const distribuicaoItens = itens.map(item => ({
      itemId: item.id,
      descricao: item.descricao,
      tipoDestino: item.tipoDestino,
      cotistas: cotasPagas.map(cota => {
        const percentual = totalArrecadado > 0 ? (cota.valor / totalArrecadado) * 100 : 0
        const quantidadeRecebida = (item.quantidade * percentual) / 100
        return {
          associadoId: cota.associadoId,
          valorCota: cota.valor,
          percentual,
          quantidadeRecebida,
        }
      }),
    }))

    return { totalArrecadado, itens: distribuicaoItens }
  }
}
