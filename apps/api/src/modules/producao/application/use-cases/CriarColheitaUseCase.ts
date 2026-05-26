import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Colheita,
  Contribuicao,
  CriarColheitaInput,
  EstoqueCampanha,
  EstoqueMateriaPrima,
  ICriarColheitaUseCase,
  IColheitaRepository,
  IContribuicaoRepository,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  ISafraRepository,
  ITipoMateriaPrimaRepository,
  MovimentacaoEstoque,
  MovimentacaoEstoqueCampanha,
} from '@apa/core'
import { StatusSafra, TipoContribuicao, TipoMovimentacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  COLHEITA_REPOSITORY,
  CONTRIBUICAO_REPOSITORY,
  ESTOQUE_CAMPANHA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  SAFRA_REPOSITORY,
  TIPO_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
/** Registra uma colheita. Com campanhaId → EstoqueCampanha + Contribuicao (RN14); sem → pool global (RN03). */
export class CriarColheitaUseCase implements ICriarColheitaUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly colheitaRepository: IColheitaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoquePoolRepo: IEstoqueMateriaPrimaRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
    @Inject(SAFRA_REPOSITORY)
    private readonly safraRepo: ISafraRepository,
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoMateriaPrimaRepo: ITipoMateriaPrimaRepository,
  ) {}

  async execute(input: CriarColheitaInput): Promise<Colheita> {
    if (input.volume <= 0) throw new BadRequestException('Volume deve ser maior que zero')

    const tipo = await this.tipoMateriaPrimaRepo.findById(input.tipoMateriaPrimaId)
    if (!tipo) throw new NotFoundException('Tipo de matéria-prima não encontrado')

    if (input.safraId) {
      const safra = await this.safraRepo.findById(input.safraId)
      if (!safra) throw new BadRequestException('Safra não encontrada')
      if (safra.status !== StatusSafra.EM_ANDAMENTO)
        throw new BadRequestException('Colheita só pode ser registrada em safra com status EM_ANDAMENTO')
    }

    const colheita = new Colheita({
      id: randomUUID(),
      associadoId: input.associadoId,
      tipoMateriaPrimaId: input.tipoMateriaPrimaId,
      equipamentoId: input.equipamentoId,
      campanhaId: input.campanhaId,
      safraId: input.safraId,
      volume: input.volume,
      dataColheita: input.dataColheita,
      observacao: input.observacao?.trim(),
      criadoEm: new Date(),
    })

    const salva = await this.colheitaRepository.save(colheita)

    if (input.campanhaId) {
      await this.adicionarAoEstoqueCampanha(input, salva.id, tipo.unidade)
      await this.contribuicaoRepo.save(new Contribuicao({
        id: randomUUID(),
        campanhaId: input.campanhaId,
        associadoId: input.associadoId,
        tipo: TipoContribuicao.COLHEITA,
        valorMonetario: 0,
        colheitaId: salva.id,
        volume: input.volume,
        tipoMateriaPrimaId: input.tipoMateriaPrimaId,
        liquidado: false,
        criadoEm: new Date(),
      }))
    } else {
      await this.adicionarAoPool(input, salva.id, tipo.unidade)
    }

    return salva
  }

  private async adicionarAoEstoqueCampanha(input: CriarColheitaInput, colheitaId: string, unidade: string): Promise<void> {
    const existente = await this.estoqueCampanhaRepo.findByCampanhaETipo(
      input.campanhaId!,
      input.tipoMateriaPrimaId,
    )

    let estoque: EstoqueCampanha
    if (existente) {
      estoque = await this.estoqueCampanhaRepo.update(existente.entrada(input.volume))
    } else {
      const inicial = new EstoqueCampanha({
        id: randomUUID(),
        campanhaId: input.campanhaId!,
        tipoMateriaPrimaId: input.tipoMateriaPrimaId,
        quantidadeDisponivel: 0,
        unidade,
        atualizadoEm: new Date(),
      })
      estoque = await this.estoqueCampanhaRepo.save(inicial.entrada(input.volume))
    }

    await this.estoqueCampanhaRepo.salvarMovimentacao(
      new MovimentacaoEstoqueCampanha({
        id: randomUUID(),
        estoqueCampanhaId: estoque.id,
        tipo: TipoMovimentacao.ENTRADA,
        quantidade: input.volume,
        referenciaId: colheitaId,
        criadoEm: new Date(),
      }),
    )
  }

  private async adicionarAoPool(input: CriarColheitaInput, colheitaId: string, unidade: string): Promise<void> {
    const estoqueExistente = await this.estoquePoolRepo.findByTipo(input.tipoMateriaPrimaId)

    let estoque: EstoqueMateriaPrima
    if (estoqueExistente) {
      estoque = await this.estoquePoolRepo.update(estoqueExistente.entrada(input.volume))
    } else {
      const inicial = new EstoqueMateriaPrima({
        id: randomUUID(),
        tipoMateriaPrimaId: input.tipoMateriaPrimaId,
        quantidadeDisponivel: 0,
        unidade,
        atualizadoEm: new Date(),
      })
      estoque = await this.estoquePoolRepo.save(inicial.entrada(input.volume))
    }

    await this.estoquePoolRepo.salvarMovimentacao(
      new MovimentacaoEstoque({
        id: randomUUID(),
        estoqueId: estoque.id,
        tipo: TipoMovimentacao.ENTRADA,
        quantidade: input.volume,
        referenciaId: colheitaId,
        criadoEm: new Date(),
      }),
    )
  }
}
