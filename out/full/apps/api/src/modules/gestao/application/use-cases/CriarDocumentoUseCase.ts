import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Documento, IDocumentoRepository, ICriarDocumentoUseCase, CriarDocumentoInput } from '@apa/core'
import { DOCUMENTO_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class CriarDocumentoUseCase implements ICriarDocumentoUseCase {
  constructor(@Inject(DOCUMENTO_REPOSITORY) private readonly repository: IDocumentoRepository) {}

  async execute(input: CriarDocumentoInput): Promise<Documento> {
    const documento = new Documento({
      id: randomUUID(),
      titulo: input.titulo,
      categoria: input.categoria,
      arquivoUrl: input.arquivoUrl,
      tamanhoBytes: input.tamanhoBytes,
      autorId: input.autorId,
      publicado: input.publicado ?? false,
      criadoEm: new Date(),
    })
    return this.repository.save(documento)
  }
}
