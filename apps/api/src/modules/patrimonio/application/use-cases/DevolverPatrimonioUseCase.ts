import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtribuicaoPatrimonio,
  IAtribuicaoPatrimonioRepository,
  IDevolverPatrimonioUseCase,
  IEquipamentoRepository,
  IInsumoRepository,
} from '@apa/core'
import { TipoPatrimonio } from '@apa/shared'
import {
  ATRIBUICAO_PATRIMONIO_REPOSITORY,
  EQUIPAMENTO_REPOSITORY,
  INSUMO_REPOSITORY,
} from '../../patrimonio.tokens'

@Injectable()
export class DevolverPatrimonioUseCase implements IDevolverPatrimonioUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
    @Inject(ATRIBUICAO_PATRIMONIO_REPOSITORY)
    private readonly atribuicaoRepository: IAtribuicaoPatrimonioRepository,
  ) {}

  async execute(atribuicaoId: string): Promise<AtribuicaoPatrimonio> {
    const atribuicao = await this.atribuicaoRepository.findById(atribuicaoId)
    if (!atribuicao) throw new NotFoundException('Atribuição não encontrada')

    const devolvida = atribuicao.devolver()

    if (atribuicao.isEquipamento()) {
      const equipamento = await this.equipamentoRepository.findById(atribuicao.insumoId)
      if (equipamento) {
        await this.equipamentoRepository.update(equipamento.marcarDisponivel())
      }
    } else {
      const insumo = await this.insumoRepository.findById(atribuicao.insumoId)
      if (insumo) {
        await this.insumoRepository.update(insumo.marcarDisponivel())
      }
    }

    return this.atribuicaoRepository.update(devolvida)
  }
}
