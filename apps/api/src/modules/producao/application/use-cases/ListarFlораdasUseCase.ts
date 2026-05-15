import { Inject, Injectable } from '@nestjs/common'
import { Florada, IFloradaRepository, IListarFlораdasUseCase } from '@apa/core'
import { FLORADA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarFlораdasUseCase implements IListarFlораdasUseCase {
  constructor(
    @Inject(FLORADA_REPOSITORY)
    private readonly repository: IFloradaRepository,
  ) {}

  execute(): Promise<Florada[]> {
    return this.repository.findAll()
  }
}
