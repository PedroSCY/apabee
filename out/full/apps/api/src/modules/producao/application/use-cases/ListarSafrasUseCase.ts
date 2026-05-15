import { Inject, Injectable } from '@nestjs/common'
import { IListarSafrasUseCase, ISafraRepository, Safra } from '@apa/core'
import { StatusSafra } from '@apa/shared'
import { SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ListarSafrasUseCase implements IListarSafrasUseCase {
  constructor(
    @Inject(SAFRA_REPOSITORY)
    private readonly repository: ISafraRepository,
  ) {}

  execute(status?: StatusSafra): Promise<Safra[]> {
    if (status) return this.repository.findByStatus(status)
    return this.repository.findAll()
  }
}
