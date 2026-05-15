import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ApuracaoCampanha,
  Equipamento,
  EstoqueMateriaPrima,
  IApuracaoCampanhaRepository,
  ICampanhaRepository,
  ICotaRepository,
  IDistribuirItensUseCase,
  IEquipamentoRepository,
  IEstoqueMateriaPrimaRepository,
  IItemAquisicaoRepository,
  ITipoMateriaPrimaRepository,
  MovimentacaoEstoque,
} from '@apa/core'
import { StatusCampanha, StatusPatrimonio, TipoDestinoAquisicao, TipoMovimentacao, UnidadeMedida } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  APURACAO_CAMPANHA_REPOSITORY,
  CAMPANHA_REPOSITORY,
  COTA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  ITEM_AQUISICAO_REPOSITORY,
  TIPO_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

const EQUIPAMENTO_REPOSITORY = 'EQUIPAMENTO_REPOSITORY'

@Injectable()
/** Executa a distribuição dos itens de uma campanha de AQUISIÇÃO: cria Equipamentos ou adiciona ao EstoqueMateriaPrima. Gera ApuracaoCampanha e transiciona para LIQUIDADA (RN20). */
export class DistribuirItensUseCase implements IDistribuirItensUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(COTA_REPOSITORY)
    private readonly cotaRepo: ICotaRepository,
    @Inject(ITEM_AQUISICAO_REPOSITORY)
    private readonly itemRepo: IItemAquisicaoRepository,
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepo: IEquipamentoRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepo: IEstoqueMateriaPrimaRepository,
    @Inject(APURACAO_CAMPANHA_REPOSITORY)
    private readonly apuracaoRepo: IApuracaoCampanhaRepository,
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
  ) {}

  async execute(campanhaId: string): Promise<ApuracaoCampanha> {
    const campanha = await this.campanhaRepo.findById(campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.CONCLUIDA)
      throw new BadRequestException('A distribuição só pode ocorrer em campanhas CONCLUIDAS')

    const cotasPagas = (await this.cotaRepo.findByCampanha(campanhaId)).filter(c => c.pago)
    if (cotasPagas.length === 0)
      throw new BadRequestException('Não há cotas confirmadas para distribuição')

    const totalArrecadado = cotasPagas.reduce((s, c) => s + c.valor, 0)
    const itens = await this.itemRepo.findByCampanha(campanhaId)

    const rateios = cotasPagas.map(cota => ({
      associadoId: cota.associadoId,
      contribuicaoTotal: cota.valor,
      percentual: totalArrecadado > 0 ? cota.valor / totalArrecadado : 0,
      valorBruto: cota.valor,
      custosRateados: 0,
      antecipacoes: 0,
      valorFinal: cota.valor,
    }))

    // Processa cada item conforme seu tipoDestino
    for (const item of itens) {
      if (item.tipoDestino === TipoDestinoAquisicao.EQUIPAMENTO) {
        await this.equipamentoRepo.save(
          new Equipamento({
            id: randomUUID(),
            nome: item.equipamentoNome ?? item.descricao,
            descricao: item.descricao,
            status: StatusPatrimonio.DISPONIVEL,
            criadoEm: new Date(),
          }),
        )
      } else {
        // CONSUMIVEL ou MATERIA_PRIMA — distribui proporcionalmente ao estoque
        if (!item.tipoMateriaPrimaId) continue
        const estoque = await this.estoqueRepo.findByTipo(item.tipoMateriaPrimaId)

        for (const cota of cotasPagas) {
          const percentual = totalArrecadado > 0 ? cota.valor / totalArrecadado : 0
          const quantidadeParaCotista = item.quantidade * percentual

          if (estoque) {
            const atualizado = await this.estoqueRepo.update(
              estoque.entrada(quantidadeParaCotista),
            )
            await this.estoqueRepo.salvarMovimentacao(
              new MovimentacaoEstoque({
                id: randomUUID(),
                estoqueId: atualizado.id,
                tipo: TipoMovimentacao.ENTRADA,
                quantidade: quantidadeParaCotista,
                referenciaId: campanhaId,
                criadoEm: new Date(),
              }),
            )
          } else {
            const tipoItem = await this.tipoRepo.findById(item.tipoMateriaPrimaId!)
            const novoEstoque = await this.estoqueRepo.save(
              new EstoqueMateriaPrima({
                id: randomUUID(),
                tipoMateriaPrimaId: item.tipoMateriaPrimaId!,
                quantidadeDisponivel: quantidadeParaCotista,
                unidade: tipoItem?.unidade ?? UnidadeMedida.UNIDADE,
                atualizadoEm: new Date(),
              }),
            )
            await this.estoqueRepo.salvarMovimentacao(
              new MovimentacaoEstoque({
                id: randomUUID(),
                estoqueId: novoEstoque.id,
                tipo: TipoMovimentacao.ENTRADA,
                quantidade: quantidadeParaCotista,
                referenciaId: campanhaId,
                criadoEm: new Date(),
              }),
            )
          }
        }
      }
    }

    const apuracao = await this.apuracaoRepo.save(
      new ApuracaoCampanha({
        id: randomUUID(),
        campanhaId,
        faturamentoTotal: totalArrecadado,
        custoTotal: 0,
        lucroLiquido: 0,
        liquidadoEm: new Date(),
        rateios,
      }),
    )

    await this.campanhaRepo.update(campanha.liquidar(totalArrecadado, 0))
    return apuracao
  }
}
