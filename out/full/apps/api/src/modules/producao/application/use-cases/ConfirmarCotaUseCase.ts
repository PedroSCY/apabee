import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Cota, ICotaRepository, IConfirmarCotaUseCase } from '@apa/core'
import { COTA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class ConfirmarCotaUseCase implements IConfirmarCotaUseCase {
  constructor(
    @Inject(COTA_REPOSITORY)
    private readonly repository: ICotaRepository,
  ) {}

  async execute(id: string): Promise<Cota> {
    const cota = await this.repository.findById(id)
    if (!cota) throw new NotFoundException('Cota não encontrada')
    if (cota.pago) throw new BadRequestException('Cota já está confirmada')
    return this.repository.update(cota.confirmar())
  }
}
