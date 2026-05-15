import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  CriarSolicitacaoInput,
  ICriarSolicitacaoUseCase,
  IEquipamentoRepository,
  IInsumoRepository,
  ITipoInsumoRepository,
  ISolicitacaoPatrimonioRepository,
  SolicitacaoPatrimonio,
} from '@apa/core'
import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import {
  EQUIPAMENTO_REPOSITORY,
  INSUMO_REPOSITORY,
  SOLICITACAO_PATRIMONIO_REPOSITORY,
  TIPO_INSUMO_REPOSITORY,
} from '../../patrimonio.tokens'

@Injectable()
export class CriarSolicitacaoUseCase implements ICriarSolicitacaoUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY) private readonly equipamentoRepository: IEquipamentoRepository,
    @Inject(TIPO_INSUMO_REPOSITORY) private readonly tipoInsumoRepository: ITipoInsumoRepository,
    @Inject(INSUMO_REPOSITORY) private readonly insumoRepository: IInsumoRepository,
    @Inject(SOLICITACAO_PATRIMONIO_REPOSITORY)
    private readonly solicitacaoRepository: ISolicitacaoPatrimonioRepository,
  ) {}

  async execute(input: CriarSolicitacaoInput): Promise<SolicitacaoPatrimonio> {
    if (input.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO) {
      const equipamento = await this.equipamentoRepository.findById(input.patrimonioId)
      if (!equipamento) throw new NotFoundException('Equipamento não encontrado.')
      if (!equipamento.estaDisponivel())
        throw new BadRequestException('Equipamento não está disponível.')

      const solicitacao = new SolicitacaoPatrimonio({
        id: randomUUID(),
        tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
        patrimonioId: input.patrimonioId,
        associadoId: input.associadoId,
        justificativa: input.justificativa,
        status: StatusSolicitacaoPatrimonio.PENDENTE,
        criadoEm: new Date(),
      })
      return this.solicitacaoRepository.save(solicitacao)
    }

    // INSUMO: solicita por tipo + quantidade
    const tipo = await this.tipoInsumoRepository.findById(input.tipoInsumoId)
    if (!tipo) throw new NotFoundException('Tipo de insumo não encontrado.')

    const unidadesDisponiveis = await this.insumoRepository.findAvailableByTipo(input.tipoInsumoId, input.quantidade)
    if (unidadesDisponiveis.length < input.quantidade) {
      throw new BadRequestException(
        `Quantidade insuficiente: ${unidadesDisponiveis.length} unidade(s) disponível(is) de "${tipo.nome}".`,
      )
    }

    const solicitacao = new SolicitacaoPatrimonio({
      id: randomUUID(),
      tipoPatrimonio: TipoPatrimonio.INSUMO,
      tipoInsumoId: input.tipoInsumoId,
      quantidade: input.quantidade,
      associadoId: input.associadoId,
      justificativa: input.justificativa,
      status: StatusSolicitacaoPatrimonio.PENDENTE,
      criadoEm: new Date(),
    })
    return this.solicitacaoRepository.save(solicitacao)
  }
}
