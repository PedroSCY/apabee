import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICancelarCotaUseCase, ICotaRepository } from '@apa/core'
import { COTA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class CancelarCotaUseCase implements ICancelarCotaUseCase {
  constructor(
    @Inject(COTA_REPOSITORY)
    private readonly repository: ICotaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const cota = await this.repository.findById(id)
    if (!cota) throw new NotFoundException('Cota não encontrada')
    if (cota.pago) throw new BadRequestException('Cota já confirmada não pode ser cancelada')
    await this.repository.delete(id)
  }
}
