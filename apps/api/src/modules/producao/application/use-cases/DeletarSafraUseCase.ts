import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ICampanhaRepository, IColheitaRepository, IDeletarSafraUseCase, ISafraRepository } from '@apa/core'
import { StatusSafra } from '@apa/shared'
import { CAMPANHA_REPOSITORY, COLHEITA_REPOSITORY, SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class DeletarSafraUseCase implements IDeletarSafraUseCase {
  constructor(
    @Inject(SAFRA_REPOSITORY) private readonly safraRepo: ISafraRepository,
    @Inject(CAMPANHA_REPOSITORY) private readonly campanhaRepo: ICampanhaRepository,
    @Inject(COLHEITA_REPOSITORY) private readonly colheitaRepo: IColheitaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const safra = await this.safraRepo.findById(id)
    if (!safra) throw new NotFoundException('Safra não encontrada')
    if (safra.status !== StatusSafra.PLANEJADA)
      throw new BadRequestException('Apenas safras PLANEJADA podem ser excluídas')

    const campanhas = await this.campanhaRepo.findAll()
    if (campanhas.some(c => c.safraId === id))
      throw new ConflictException('Não é possível excluir: existem campanhas vinculadas a esta safra')

    const colheitas = await this.colheitaRepo.findAll()
    if (colheitas.some(c => c.safraId === id))
      throw new ConflictException('Não é possível excluir: existem colheitas vinculadas a esta safra')

    await this.safraRepo.delete(id)
  }
}
