import { Inject, Injectable } from '@nestjs/common'
import { IInsumoRepository, IListarInsumosUseCase, Insumo } from '@apa/core'
import { INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ListarInsumosUseCase implements IListarInsumosUseCase {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(): Promise<Insumo[]> {
    return this.insumoRepository.findAll()
  }
}
