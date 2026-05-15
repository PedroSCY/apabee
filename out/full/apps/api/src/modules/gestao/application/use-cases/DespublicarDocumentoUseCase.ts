import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Documento, IDocumentoRepository, IDespublicarDocumentoUseCase } from '@apa/core'
import { DOCUMENTO_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class DespublicarDocumentoUseCase implements IDespublicarDocumentoUseCase {
  constructor(@Inject(DOCUMENTO_REPOSITORY) private readonly repository: IDocumentoRepository) {}

  async execute(id: string): Promise<Documento> {
    const doc = await this.repository.findById(id)
    if (!doc) throw new NotFoundException('Documento não encontrado')
    return this.repository.update(doc.despublicar())
  }
}
