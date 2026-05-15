import { Inject, Injectable } from '@nestjs/common'
import {
  AtribuicaoPatrimonio,
  IAtribuicaoPatrimonioRepository,
  IListarTodasAtribuicoesUseCase,
} from '@apa/core'
import { ATRIBUICAO_PATRIMONIO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ListarTodasAtribuicoesUseCase implements IListarTodasAtribuicoesUseCase {
  constructor(
    @Inject(ATRIBUICAO_PATRIMONIO_REPOSITORY)
    private readonly atribuicaoRepository: IAtribuicaoPatrimonioRepository,
  ) {}

  async execute(): Promise<AtribuicaoPatrimonio[]> {
    return this.atribuicaoRepository.findAll()
  }
}
