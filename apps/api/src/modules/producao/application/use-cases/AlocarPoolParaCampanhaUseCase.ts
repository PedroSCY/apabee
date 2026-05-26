import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { TipoContribuicao, TipoMovimentacao, StatusCampanha } from '@apa/shared'
import {
  AlocarPoolParaCampanhaInput,
  Contribuicao,
  EstoqueCampanha,
  IAlocarPoolParaCampanhaUseCase,
  ICampanhaRepository,
  IContribuicaoRepository,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  MovimentacaoEstoque,
  MovimentacaoEstoqueCampanha,
} from '@apa/core'
import {
  CAMPANHA_REPOSITORY,
  CONTRIBUICAO_REPOSITORY,
  ESTOQUE_CAMPANHA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
export class AlocarPoolParaCampanhaUseCase implements IAlocarPoolParaCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY) private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY) private readonly poolRepo: IEstoqueMateriaPrimaRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY) private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
    @Inject(CONTRIBUICAO_REPOSITORY) private readonly contribuicaoRepo: IContribuicaoRepository,
  ) {}

  async execute(input: AlocarPoolParaCampanhaInput): Promise<void> {
    const { campanhaId, tipoMateriaPrimaId, quantidade, valorMonetario } = input

    const campanha = await this.campanhaRepo.findById(campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada.')

    if (
      campanha.status !== StatusCampanha.PLANEJADA &&
      campanha.status !== StatusCampanha.ATIVA
    ) {
      throw new ConflictException('Alocação de pool permitida apenas em campanhas PLANEJADA ou ATIVA.')
    }

    const pool = await this.poolRepo.findByTipo(tipoMateriaPrimaId)
    if (!pool) throw new NotFoundException('Matéria-prima não encontrada no pool.')

    if (!pool.temSaldo(quantidade)) {
      throw new ConflictException(
        `Saldo insuficiente no pool. Disponível: ${pool.quantidadeDisponivel} ${pool.unidade}.`,
      )
    }

    // Baixa no pool
    const poolAtualizado = pool.saida(quantidade)
    await this.poolRepo.update(poolAtualizado)
    await this.poolRepo.salvarMovimentacao(
      new MovimentacaoEstoque({
        id: randomUUID(),
        estoqueId: pool.id,
        tipo: TipoMovimentacao.SAIDA,
        quantidade,
        referenciaId: campanhaId,
        criadoEm: new Date(),
      }),
    )

    // Entrada no estoque da campanha
    let estoqueCampanha = await this.estoqueCampanhaRepo.findByCampanhaETipo(campanhaId, tipoMateriaPrimaId)

    if (estoqueCampanha) {
      estoqueCampanha = estoqueCampanha.entrada(quantidade)
      await this.estoqueCampanhaRepo.update(estoqueCampanha)
    } else {
      estoqueCampanha = new EstoqueCampanha({
        id: randomUUID(),
        campanhaId,
        tipoMateriaPrimaId,
        quantidadeDisponivel: quantidade,
        unidade: pool.unidade,
        atualizadoEm: new Date(),
      })
      await this.estoqueCampanhaRepo.save(estoqueCampanha)
    }

    await this.estoqueCampanhaRepo.salvarMovimentacao(
      new MovimentacaoEstoqueCampanha({
        id: randomUUID(),
        estoqueCampanhaId: estoqueCampanha.id,
        tipo: TipoMovimentacao.ENTRADA,
        quantidade,
        referenciaId: pool.id,
        criadoEm: new Date(),
      }),
    )

    // Registra como contribuição da associação (associadoId = null)
    await this.contribuicaoRepo.save(
      new Contribuicao({
        id: randomUUID(),
        campanhaId,
        associadoId: null,
        tipo: TipoContribuicao.COLHEITA,
        valorMonetario,
        volume: quantidade,
        tipoMateriaPrimaId,
        descricao: `Alocação do pool da associação — ${quantidade} ${pool.unidade}`,
        liquidado: false,
        criadoEm: new Date(),
      }),
    )
  }
}
