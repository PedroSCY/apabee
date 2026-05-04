import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtribuicaoPatrimonio,
  AtribuirPatrimonioInput,
  IAtribuicaoPatrimonioRepository,
  IAtribuirPatrimonioUseCase,
  IEquipamentoRepository,
  IInsumoRepository,
} from '@apa/core'
import { StatusAtribuicao, TipoPatrimonio } from '@apa/shared'
import { randomUUID } from 'crypto'
import {
  ATRIBUICAO_PATRIMONIO_REPOSITORY,
  EQUIPAMENTO_REPOSITORY,
  INSUMO_REPOSITORY,
} from '../../patrimonio.tokens'

@Injectable()
export class AtribuirPatrimonioUseCase implements IAtribuirPatrimonioUseCase {
  constructor(
    @Inject(EQUIPAMENTO_REPOSITORY)
    private readonly equipamentoRepository: IEquipamentoRepository,
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
    @Inject(ATRIBUICAO_PATRIMONIO_REPOSITORY)
    private readonly atribuicaoRepository: IAtribuicaoPatrimonioRepository,
  ) {}

  async execute(input: AtribuirPatrimonioInput): Promise<AtribuicaoPatrimonio> {
    const ativaExistente = await this.atribuicaoRepository.findAtivaByPatrimonio(
      input.patrimonioId,
      input.tipoPatrimonio,
    )
    if (ativaExistente) {
      throw new BadRequestException('Patrimônio já possui atribuição ativa (RN02)')
    }

    if (input.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO) {
      const equipamento = await this.equipamentoRepository.findById(input.patrimonioId)
      if (!equipamento) throw new NotFoundException('Equipamento não encontrado')
      if (!equipamento.estaDisponivel()) {
        throw new BadRequestException('Equipamento não está disponível para atribuição')
      }
      await this.equipamentoRepository.update(equipamento.marcarEmUso())
    } else {
      const insumo = await this.insumoRepository.findById(input.patrimonioId)
      if (!insumo) throw new NotFoundException('Insumo não encontrado')
      if (!insumo.estaDisponivel()) {
        throw new BadRequestException('Insumo não está disponível para atribuição')
      }
      await this.insumoRepository.update(insumo.marcarEmUso())
    }

    const atribuicao = new AtribuicaoPatrimonio({
      id: randomUUID(),
      patrimonioId: input.patrimonioId,
      tipoPatrimonio: input.tipoPatrimonio,
      associadoId: input.associadoId,
      dataInicio: input.dataInicio ?? new Date(),
      status: StatusAtribuicao.ATIVO,
      observacao: input.observacao,
    })

    return this.atribuicaoRepository.save(atribuicao)
  }
}
