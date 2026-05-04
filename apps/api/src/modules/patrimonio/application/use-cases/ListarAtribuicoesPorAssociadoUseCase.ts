import { Inject, Injectable } from '@nestjs/common'
import {
  AtribuicaoPatrimonio,
  IAtribuicaoPatrimonioRepository,
  IListarAtribuicoesPorAssociadoUseCase,
} from '@apa/core'
import { ATRIBUICAO_PATRIMONIO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ListarAtribuicoesPorAssociadoUseCase
  implements IListarAtribuicoesPorAssociadoUseCase
{
  constructor(
    @Inject(ATRIBUICAO_PATRIMONIO_REPOSITORY)
    private readonly atribuicaoRepository: IAtribuicaoPatrimonioRepository,
  ) {}

  async execute(associadoId: string): Promise<AtribuicaoPatrimonio[]> {
    return this.atribuicaoRepository.findByAssociado(associadoId)
  }
}
