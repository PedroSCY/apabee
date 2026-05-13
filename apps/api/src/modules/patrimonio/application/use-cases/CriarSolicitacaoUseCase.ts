import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  CriarSolicitacaoInput,
  ICriarSolicitacaoUseCase,
  IEquipamentoRepository,
  IInsumoRepository,
  ISolicitacaoPatrimonioRepository,
  SolicitacaoPatrimonio,
} from '@apa/core'
import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import {
  EQUIPAMENTO_REPOSITORY,
  INSUMO_REPOSITORY,
  SOLICITACAO_PATRIMONIO_REPOSITORY,
} from '../../patrimonio.tokens'

@Injectable()
export class CriarSolicitacaoUseCase implements ICriarSolicitacaoUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY) private readonly equipamentoRepository: IEquipamentoRepository,
    @Inject(INSUMO_REPOSITORY) private readonly insumoRepository: IInsumoRepository,
    @Inject(SOLICITACAO_PATRIMONIO_REPOSITORY)
    private readonly solicitacaoRepository: ISolicitacaoPatrimonioRepository,
  ) {}

  async execute(input: CriarSolicitacaoInput): Promise<SolicitacaoPatrimonio> {
    if (input.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO) {
      const equipamento = await this.equipamentoRepository.findById(input.patrimonioId)
      if (!equipamento) throw new NotFoundException('Equipamento não encontrado.')
      if (!equipamento.estaDisponivel())
        throw new BadRequestException('Equipamento não está disponível para solicitação.')
    } else {
      const insumo = await this.insumoRepository.findById(input.patrimonioId)
      if (!insumo) throw new NotFoundException('Insumo não encontrado.')
      if (!insumo.estaDisponivel())
        throw new BadRequestException('Insumo não está disponível para solicitação.')
    }

    const solicitacao = new SolicitacaoPatrimonio({
      id: randomUUID(),
      tipoPatrimonio: input.tipoPatrimonio,
      patrimonioId: input.patrimonioId,
      associadoId: input.associadoId,
      justificativa: input.justificativa,
      status: StatusSolicitacaoPatrimonio.PENDENTE,
      criadoEm: new Date(),
    })

    return this.solicitacaoRepository.save(solicitacao)
  }
}
