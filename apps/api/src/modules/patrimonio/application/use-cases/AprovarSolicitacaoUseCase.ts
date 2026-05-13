import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IAprovarSolicitacaoUseCase,
  IAtribuirPatrimonioUseCase,
  IInsumoRepository,
  ISolicitacaoPatrimonioRepository,
  SolicitacaoPatrimonio,
} from '@apa/core'
import { TipoPatrimonio } from '@apa/shared'
import {
  ATRIBUIR_PATRIMONIO_USE_CASE,
  INSUMO_REPOSITORY,
  SOLICITACAO_PATRIMONIO_REPOSITORY,
} from '../../patrimonio.tokens'

@Injectable()
export class AprovarSolicitacaoUseCase implements IAprovarSolicitacaoUseCase {
  constructor(
    @Inject(SOLICITACAO_PATRIMONIO_REPOSITORY)
    private readonly solicitacaoRepository: ISolicitacaoPatrimonioRepository,
    @Inject(ATRIBUIR_PATRIMONIO_USE_CASE)
    private readonly atribuirPatrimonio: IAtribuirPatrimonioUseCase,
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(solicitacaoId: string): Promise<SolicitacaoPatrimonio> {
    const solicitacao = await this.solicitacaoRepository.findById(solicitacaoId)
    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.')
    if (!solicitacao.isPendente())
      throw new BadRequestException('Apenas solicitações pendentes podem ser aprovadas.')

    if (solicitacao.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO) {
      await this.atribuirPatrimonio.execute({
        patrimonioId: solicitacao.patrimonioId!,
        tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
        associadoId: solicitacao.associadoId,
        observacao: solicitacao.justificativa,
      })
    } else {
      // INSUMO: atribuir as N unidades disponíveis automaticamente
      const quantidade = solicitacao.quantidade ?? 1
      const unidades = await this.insumoRepository.findAvailableByTipo(
        solicitacao.tipoInsumoId!,
        quantidade,
      )
      if (unidades.length < quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente: apenas ${unidades.length} unidade(s) disponível(is).`,
        )
      }
      for (const unidade of unidades) {
        await this.atribuirPatrimonio.execute({
          patrimonioId: unidade.id,
          tipoPatrimonio: TipoPatrimonio.INSUMO,
          associadoId: solicitacao.associadoId,
          observacao: solicitacao.justificativa,
        })
      }
    }

    return this.solicitacaoRepository.update(solicitacao.aprovar())
  }
}
