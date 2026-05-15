import { Inject, Injectable } from '@nestjs/common'
import { IListarPrecosSafraUseCase, IPrecoSafraRepository, PrecoSafra } from '@apa/core'
import { PRECO_SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarPrecosSafraUseCase implements IListarPrecosSafraUseCase {
  constructor(
    @Inject(PRECO_SAFRA_REPOSITORY)
    private readonly repository: IPrecoSafraRepository,
  ) {}

  execute(safraId: string): Promise<PrecoSafra[]> {
    return this.repository.findBySafra(safraId)
  }
}
