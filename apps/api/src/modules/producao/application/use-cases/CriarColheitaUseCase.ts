import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Colheita,
  CriarColheitaInput,
  EstoqueMateriaPrima,
  ICriarColheitaUseCase,
  IColheitaRepository,
  IEstoqueMateriaPrimaRepository,
  ILoteProducaoRepository,
  MovimentacaoEstoque,
} from '@apa/core'
import { TipoMovimentacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  COLHEITA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  LOTE_PRODUCAO_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
/** Registra uma colheita e atualiza o estoque de matéria-prima (RN03). */
export class CriarColheitaUseCase implements ICriarColheitaUseCase {
  constructor(
    @Inject(COLHEITA_REPOSITORY)
    private readonly colheitaRepository: IColheitaRepository,
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly loteRepository: ILoteProducaoRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepository: IEstoqueMateriaPrimaRepository,
  ) {}

  /** Executa o registro da colheita com validação do lote e entrada automática no estoque. */
  async execute(input: CriarColheitaInput): Promise<Colheita> {
    const lote = await this.loteRepository.findById(input.loteProducaoId)
    if (!lote) throw new NotFoundException('Lote de produção não encontrado')
    if (!lote.estaAberto()) throw new BadRequestException('Lote não está aberto para registros')

    const colheita = new Colheita({
      id: randomUUID(),
      associadoId: input.associadoId,
      tipoMateriaPrimaId: input.tipoMateriaPrimaId,
      equipamentoId: input.equipamentoId,
      loteProducaoId: input.loteProducaoId,
      volume: input.volume,
      unidade: input.unidade,
      dataColheita: input.dataColheita,
      observacao: input.observacao?.trim(),
      criadoEm: new Date(),
    })

    if (!colheita.validar()) throw new BadRequestException('Volume deve ser maior que zero')

    const salva = await this.colheitaRepository.save(colheita)

    // RN03 — entrada automática no estoque ao registrar colheita
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
