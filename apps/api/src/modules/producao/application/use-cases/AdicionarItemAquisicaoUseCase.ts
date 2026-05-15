import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AdicionarItemAquisicaoInput,
  IAdicionarItemAquisicaoUseCase,
  ICampanhaRepository,
  IItemAquisicaoRepository,
  ItemAquisicao,
} from '@apa/core'
import { StatusCampanha } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY, ITEM_AQUISICAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class AdicionarItemAquisicaoUseCase implements IAdicionarItemAquisicaoUseCase {
  constructor(
    @Inject(ITEM_AQUISICAO_REPOSITORY)
    private readonly itemRepo: IItemAquisicaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(input: AdicionarItemAquisicaoInput): Promise<ItemAquisicao> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.status !== StatusCampanha.PLANEJADA && campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Itens só podem ser adicionados em campanhas PLANEJADAS ou ATIVAS')

    return this.itemRepo.save(
      new ItemAquisicao({
        id: randomUUID(),
        campanhaId: input.campanhaId,
        descricao: input.descricao.trim(),
        quantidade: input.quantidade,
        valorEstimado: input.valorEstimado,
        tipoDestino: input.tipoDestino,
        equipamentoNome: input.equipamentoNome,
        tipoMateriaPrimaId: input.tipoMateriaPrimaId,
        criadoEm: new Date(),
      }),
    )
  }
}
