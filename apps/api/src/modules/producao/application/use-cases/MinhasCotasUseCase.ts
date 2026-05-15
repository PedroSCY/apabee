import { Inject, Injectable } from '@nestjs/common'
import { Cota, ICotaRepository, IMinhasCotasUseCase } from '@apa/core'
import { COTA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class MinhasCotasUseCase implements IMinhasCotasUseCase {
  constructor(
    @Inject(COTA_REPOSITORY)
    private readonly repository: ICotaRepository,
  ) {}

  async execute(associadoId: string): Promise<Cota[]> {
    return this.repository.findByAssociado(associadoId)
  }
}
