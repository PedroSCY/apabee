import { Inject, Injectable } from '@nestjs/common'
import { Documento, IDocumentoRepository, IListarDocumentosUseCase } from '@apa/core'
import { CategoriaDocumento } from '@apa/shared'
import { DOCUMENTO_REPOSITORY } from '../../gestao.tokens'

@Injectable()
export class ListarDocumentosUseCase implements IListarDocumentosUseCase {
  constructor(@Inject(DOCUMENTO_REPOSITORY) private readonly repository: IDocumentoRepository) {}

  async execute(categoria?: CategoriaDocumento, apenasPublicados?: boolean): Promise<Documento[]> {
    if (categoria) return this.repository.findByCategoria(categoria)
    if (apenasPublicados) return this.repository.findPublicados()
    return this.repository.findAll()
  }
}
