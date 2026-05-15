import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import {
  Colheita,
  CriarColheitaInput,
  EstoqueMateriaPrima,
  ICriarColheitaUseCase,
  IColheitaRepository,
  IEstoqueMateriaPrimaRepository,
  MovimentacaoEstoque,
} from '@apa/core'
import { TipoMovimentacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  COLHEITA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
/** Registra uma colheita e adiciona o volume ao pool (EstoqueMateriaPrima — RN03/RN14). */
export class CriarColheitaUseCase implements ICriarColheitaUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly colheitaRepository: IColheitaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepository: IEstoqueMateriaPrimaRepository,
  ) {}

  async execute(input: CriarColheitaInput): Promise<Colheita> {
    if (input.volume <= 0) throw new BadRequestException('Volume deve ser maior que zero')

    const colheita = new Colheita({
      id: randomUUID(),
      associadoId: input.associadoId,
      tipoMateriaPrimaId: input.tipoMateriaPrimaId,
      equipamentoId: input.equipamentoId,
      campanhaId: input.campanhaId,
      safraId: input.safraId,
      volume: input.volume,
      unidade: input.unidade,
      dataColheita: input.dataColheita,
      observacao: input.observacao?.trim(),
      criadoEm: new Date(),
    })

    const salva = await this.colheitaRepository.save(colheita)

    // RN03 — toda colheita alimenta o pool (EstoqueMateriaPrima)
    const estoqueExistente = await this.estoqueRepository.findByTipo(input.tipoMateriaPrimaId)
    let estoque: EstoqueMateriaPrima
    if (estoqueExistente) {
      estoque = await this.estoqueRepository.update(estoqueExistente.entrada(input.volume))
    } else {
      const inicial = new EstoqueMateriaPrima({
        id: randomUUID(),
        tipoMateriaPrimaId: input.tipoMateriaPrimaId,
        quantidadeDisponivel: 0,
        unidade: input.unidade,
        atualizadoEm: new Date(),
      })
      estoque = await this.estoqueRepository.save(inicial.entrada(input.volume))
    }

    await this.estoqueRepository.salvarMovimentacao(
      new MovimentacaoEstoque({
        id: randomUUID(),
        estoqueId: estoque.id,
        tipo: TipoMovimentacao.ENTRADA,
        quantidade: input.volume,
        referenciaId: salva.id,
        criadoEm: new Date(),
      }),
    )

    return salva
  }
}
